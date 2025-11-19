import { create } from "zustand";
import socket from "@/lib/socket";
import type { IUser } from "@/Types";
import type { IProfile } from "@/Types/socket";

type CallMeta = { type: "audio" | "video" };

type IncomingCall = {
  fromUserId: string;
  callId: string;
  metadata?: CallMeta;
  caller: IUser;
} | null;

type CallState = {
  // reactive state
  incomingCall: IncomingCall;
  isCalling: boolean;
  inCall: boolean;
  muted: boolean;
  videoEnabled: boolean;
  remoteVideoEnabled: boolean;
  activeCall: { callId: string; peerId: string; metadata?: CallMeta, caller: IUser } | null;

  // mutable refs (not reactive, but we keep them here)
  pc: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localVideoEl: HTMLVideoElement | null;
  remoteVideoEl: HTMLVideoElement | null;

  // actions
  init: () => void;
  dispose: () => void;
  startCall: (user: IProfile, type?: "audio" | "video") => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: (reason?: string) => void;
  hangup: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setLocalVideoEl: (el: HTMLVideoElement | null) => void;
  setRemoteVideoEl: (el: HTMLVideoElement | null) => void;
};

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const useCallStore = create<CallState>((set, get) => {
  // helpers (non-exported)
  const ensureLocalMedia = async (wantVideo: boolean) => {
    if (get().localStream) {
      const hasVideo = get().localStream!.getVideoTracks().length > 0;
      if (
        (wantVideo && hasVideo) ||
        (!wantVideo && get().localStream!.getAudioTracks().length > 0)
      ) {
        return get().localStream!;
      }
    }

    const constraints: MediaStreamConstraints = {
      audio: true,
      video: wantVideo ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // attach to local preview if present
    const localEl = get().localVideoEl;
    if (stream.getVideoTracks().length > 0 && localEl) {
      localEl.muted = true;
      localEl.srcObject = stream;
      localEl.play().catch(() => {});
      set({ videoEnabled: true });
    } else {
      set({ videoEnabled: false });
    }

    // stop old stream if switching
    if (get().localStream) {
      try {
        get()
          .localStream!.getTracks()
          .forEach((t) => t.stop());
      } catch {}
    }
    // set localStream ref (mutable)
    set({ localStream: stream });
    return stream;
  };

  const createPeer = async (
    isInitiator: boolean,
    peerId: string,
    callId: string,
    metadata?: CallMeta
  ): Promise<RTCPeerConnection> => {
    // console.log("store.createPeer", { isInitiator, peerId, callId, metadata });
    if (get().pc) {
      console.warn("store.createPeer: reusing existing pc");
      return get().pc!;
    }
    const pc = new RTCPeerConnection(ICE_CONFIG);
    // set pc ref
    set({ pc });

    pc.onicecandidate = (ev) => {
      // console.log("store.pc.onicecandidate", ev.candidate);
      if (ev.candidate) {
        socket.emit("call:signal", {
          toUserId: peerId,
          callId,
          data: { candidate: ev.candidate },
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      // console.log("store.pc.iceConnectionState", pc.iceConnectionState);
    };

    pc.ontrack = (ev) => {
      const stream = ev.streams?.[0];
      if (!stream) return;

      set({ remoteStream: stream });
      console.log("store.pc.ontrack", stream);
      
      // detect remote video track
      const videoTrack = stream.getVideoTracks()[0];
      console.log("videoTrack", videoTrack, videoTrack?.muted);

      if (videoTrack) {
          set({ remoteVideoEnabled: !videoTrack.muted });

        // detect when remote user turns OFF camera
        videoTrack.onended = () => {
          set({ remoteVideoEnabled: false });
        };

        videoTrack.onmute = () => {
          console.log("Track muted");
          set({ remoteVideoEnabled: false });
        };

        videoTrack.onunmute = () => {
          console.log("Track unmuted");
          set({ remoteVideoEnabled: true });
        };
      } else {
        // no video track at all (audio-only)
        set({ remoteVideoEnabled: false });
      }

      const el = get().remoteVideoEl;
      if (el) {
        el.srcObject = stream;
        el.play().catch(() => {});
      }
    };

    const wantVideo = metadata?.type === "video";

    // try to get media, with fallback if camera not found
    let localStream: MediaStream | null = null;
    try {
      localStream = await ensureLocalMedia(wantVideo);
    } catch (err: any) {
      const fallbackErrors = ["NotFoundError", "OverconstrainedError", "NotReadableError"];
      if (wantVideo && err && fallbackErrors.includes(err.name)) {
        console.warn("createPeer: camera missing — falling back to audio-only", err.name);
        // update metadata and activeCall
        const active = get().activeCall;
        if (active) active.metadata = { type: "audio" };
        metadata = { type: "audio" };
        try {
          localStream = await ensureLocalMedia(false);
        } catch (fallbackErr) {
          console.error("createPeer fallback failed", fallbackErr);
          throw fallbackErr;
        }
      } else {
        console.error("createPeer: media acquisition failed", err);
        throw err;
      }
    }

    if (!localStream) throw new Error("No local stream available");

    // add tracks
    localStream.getTracks().forEach((t) => {
      try {
        pc.addTrack(t, localStream!);
      } catch (e) {
        console.warn("pc.addTrack failed in store", e);
      }
    });

    // initiator sends offer
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call:signal", { toUserId: peerId, callId, data: pc.localDescription });
    }

    return pc;
  };

  const shutdownCall = () => {
    // console.log("store.shutdownCall");
    try {
      get().pc?.close();
    } catch {}
    set({
      pc: null,
      remoteStream: null,
      activeCall: null,
      incomingCall: null,
      inCall: false,
      isCalling: false,
      videoEnabled: false,
      muted: false,
    });
    if (get().localStream) {
      try {
        get()
          .localStream!.getTracks()
          .forEach((t) => t.stop());
      } catch {}
      set({ localStream: null });
    }
    if (get()?.localVideoEl) (get().localVideoEl as any).srcObject = null;
    if (get()?.remoteVideoEl) (get().remoteVideoEl as any).srcObject = null;
  };

  // attach socket listeners once
  const init = () => {
    // console.log("store.init — attaching socket listeners");
    socket.on("call:incoming", async (payload) => {
      // console.log("socket call:incoming", payload);
      const state = get();
      if (state.inCall || state.isCalling || state.activeCall) {
        socket.emit("call:reject", {
          callId: payload?.callId || "",
          toUserId: payload?.fromUserId || "",
          reason: "busy",
        });
        return;
      }

      // If incoming call wants video, try to get a preview immediately (don't add to pc)
      if (payload?.metadata?.type === "video") {
        try {
          await ensureLocalMedia(true);
        } catch (err) {
          console.warn("incoming: couldn't acquire preview camera — will show audio-only", err);
          // optionally inform UI or update incoming payload metadata to audio
          payload = { ...payload, metadata: { type: "audio" } };
        }
      }

      set({ incomingCall: payload });
    });

    socket.on("call:accepted", async (payload: { fromUserId: string; callId: string }) => {
      // console.log("socket call:accepted", payload);
      const active = get().activeCall;
      try {
        await createPeer(true, payload.fromUserId, payload.callId, active?.metadata);
        set({ isCalling: false, inCall: true });
        if (get().muted) {
          const s = get().localStream;
          if (!s) return;
          s.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
          // console.log("store.acceptCall unmute", s);
        }
      } catch (err) {
        console.error("store.onAccepted createPeer failed", err);
        shutdownCall();
      }
    });

    socket.on("call:signal", async (payload) => {
      // console.log("socket call:signal", payload);
      const { fromUserId, callId, data, caller, } = payload;
      if (!get().pc && data?.type === "offer") {
        // create peer as callee; prefer incomingCall or activeCall metadata
        const meta = get().incomingCall?.metadata ??
          get().activeCall?.metadata ?? { type: "audio" as const };
        set({ activeCall: { callId, peerId: fromUserId, metadata: meta, caller: caller }});
        try {
          await createPeer(false, fromUserId, callId, meta);
        } catch (err) {
          console.error("store: createPeer on offer failed", err);
          return;
        }
      }

      const pc = get().pc;
      if (!pc) {
        console.warn("store.onSignal: no pc available - ignoring signal");
        return;
      }

      try {
        if (data?.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("call:signal", { toUserId: fromUserId, callId, data: pc.localDescription });
          set({ inCall: true });
        } else if (data?.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          set({ inCall: true });
        } else if (data?.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("store.onSignal handler error", err);
      }
    });

    socket.on("call:rejected", (payload) => {
      console.log("socket call:rejected", payload);
      shutdownCall();
    });

    socket.on("call:hangup", (payload) => {
      console.log("socket call:hangup", payload);
      shutdownCall();
    });
  };

  const dispose = () => {
    // console.log("store.dispose — removing socket listeners");
    socket.off("call:incoming");
    socket.off("call:accepted");
    socket.off("call:signal");
    socket.off("call:rejected");
    socket.off("call:hangup");
    shutdownCall();
  };

  // public actions
  const startCall = async (user: IProfile, type: "audio" | "video" = "audio") => {
    console.log("startCall", user, type);
    const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ activeCall: { callId, peerId: user.id || "", metadata: { type }, caller: user }, isCalling: true });
    // console.log("store.startCall", { toUserId, callId, type });

    // If this is a video call, get the local camera immediately to show preview
    if (type === "video") {
      try {
        // ensureLocalMedia will attach preview to localVideoEl if present
        await ensureLocalMedia(true);
        // keep videoEnabled state already set by ensureLocalMedia
      } catch (err) {
        console.warn("startCall: preview camera unavailable - continuing audio-only", err);
        // degrade metadata to audio so remote knows (optional)
        set((s) => ({
          activeCall: s.activeCall
            ? { ...s.activeCall, metadata: { type: "audio" } }
            : s.activeCall,
        }));
      }
    }

    socket.emit("call:call-init", { toUserId: user.id || "", callId, metadata: { type } });
  };

  const acceptCall = async () => {
    const incoming = get().incomingCall;
    if (!incoming) return;
    set({
      activeCall: {
        callId: incoming.callId,
        peerId: incoming.fromUserId,
        metadata: incoming.metadata,
        caller: incoming.caller
      },
    });
    socket.emit("call:accept", { callId: incoming.callId, toUserId: incoming.fromUserId });
    try {
      await createPeer(false, incoming.fromUserId, incoming.callId, incoming.metadata);
      set({ inCall: true, incomingCall: null });
      if (get().muted) {
        const s = get().localStream;
        if (!s) return;
        s.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      }
    } catch (err) {
      console.error("store.acceptCall createPeer failed", err);
      shutdownCall();
    }
  };

  const rejectCall = (reason?: string) => {
    // console.log("store.rejectCall", get());
    const incoming = get().incomingCall;
    if (!incoming) return;
    socket.emit("call:reject", { callId: incoming.callId, toUserId: incoming.fromUserId, reason });
    set({ incomingCall: null });

    // stop preview video tracks if we are not in any call
    const ls = get().localStream;
    if (ls && !get().inCall && !get().activeCall) {
      ls.getVideoTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      // update state
      set({ videoEnabled: false });
    }
  };

  const hangup = () => {
    const active = get().activeCall;
    if (!active) return;
    socket.emit("call:hangup", { callId: active.callId, toUserId: active.peerId });

    // stop preview video tracks if we are not in any call
    const ls = get().localStream;
    if (ls && !get().inCall && !get().activeCall) {
      ls.getVideoTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      // update state
      set({ videoEnabled: false });
    }
    shutdownCall();
  };

  const toggleMute = () => {
    const s = get().localStream;
    set((s0) => ({ muted: !s0.muted }));
    if (!s) return;
    s.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
  };

  const toggleVideo = async () => {
    const s = get().localStream;
    const hasVideoTrack = !!(s && s.getVideoTracks().length > 0);

    // if there is a pc and we currently have no video track but want to enable -> upgrade
    if (!hasVideoTrack) {
      await upgradeToVideo();
      return;
    }

    // if we do have video tracks, toggle their enabled state
    if (s) {
      const vtracks = s.getVideoTracks();
      if (vtracks.length === 0) return;
      const anyEnabled = vtracks.some((t) => t.enabled);
      vtracks.forEach((t) => (t.enabled = !anyEnabled));
      set((state) => ({ videoEnabled: !state.videoEnabled }));

      // if turning video off entirely (we disabled tracks), we also renegotiate to remove m-line
      if (anyEnabled === true) {
        // user turned video off; remove tracks + renegotiate
        await downgradeFromVideo();
      }
    }
  };

  const sendRenegotiationOffer = async () => {
    const pc = get().pc;
    const active = get().activeCall;
    if (!pc || !active) {
      console.warn("sendRenegotiationOffer: no pc or no active call");
      return;
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call:signal", {
        toUserId: active.peerId,
        callId: active.callId,
        data: pc.localDescription,
      });
      // console.log("sendRenegotiationOffer: sent offer for renegotiation");
    } catch (err) {
      console.error("sendRenegotiationOffer Error", err);
    }
  };

  /**
   * Upgrade current call to video:
   * - ensure local camera stream
   * - add video tracks to pc
   * - renegotiate (send offer)
   */
  const upgradeToVideo = async () => {
    const pc = get().pc;
    const active = get().activeCall;
    const existingStream = get().localStream; // Get the current (audio-only) stream

    if (!existingStream) {
      // console.error("upgradeToVideo: cannot upgrade, no existing localStream");
      // Fallback: just get a new stream (though this shouldn't happen in a call)
      await ensureLocalMedia(true);
      return;
    }

    try {
      // 1. Get *only* the video media
      const videoConstraints: MediaStreamConstraints = {
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      };
      const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      const videoTracks = videoStream.getVideoTracks();

      if (videoTracks.length === 0) {
        throw new Error("No video tracks found from getUserMedia");
      }

      // 2. Add the new video tracks to our *existing* localStream
      //    This keeps the original audio track alive.
      videoTracks.forEach((track) => {
        existingStream.addTrack(track);
      });

      // 3. Attach full stream to local preview if present
      const localEl = get().localVideoEl;
      if (localEl) {
        localEl.muted = true;
        localEl.srcObject = existingStream; // Use the *modified* existing stream
        localEl.play().catch(() => {});
      }
      set({ videoEnabled: true }); // We now have video tracks enabled

      // 4. Add video tracks to the PC (if pc exists)
      if (!pc) {
        // Not connected yet; just update metadata
        if (active) active.metadata = { type: "video" };
        set({ activeCall: active, videoEnabled: true });
        return; // No PC to update
      }

      // 5. Add new tracks to the PC for sending
      videoTracks.forEach((track) => {
        try {
          pc.addTrack(track, existingStream);
        } catch (e) {
          console.warn("upgradeToVideo: pc.addTrack failed", e);
        }
      });

      // 6. Update metadata
      if (active) {
        active.metadata = { type: "video" };
        set({ activeCall: active });
      }

      // 7. Request renegotiation
      await sendRenegotiationOffer();
      set({ videoEnabled: true });
    } catch (err: any) {
      const fallbackErrors = ["NotFoundError", "OverconstrainedError", "NotReadableError"];
      if (err && fallbackErrors.includes(err.name)) {
        console.warn("upgradeToVideo: camera missing — keeping audio-only", err.name);
        set({ videoEnabled: false });
        return;
      }
      console.error("upgradeToVideo failed", err);
      // Clean up added tracks if something went wrong
      get()
        .localStream?.getVideoTracks()
        .forEach((t) => t.stop());
      set({ videoEnabled: false });
    }
  };

  /**
   * Remove local video tracks and renegotiate to drop video
   */
  const downgradeFromVideo = async () => {
    const pc = get().pc;
    const active = get().activeCall;
    if (!pc) {
      // just update state
      set({ videoEnabled: false });
      return;
    }

    try {
      // stop and remove local video tracks from localStream
      const ls = get().localStream;
      if (ls) {
        ls.getVideoTracks().forEach((t) => {
          try {
            t.stop();
            // remove track from stream object if internally used
            try {
              ls.removeTrack(t);
            } catch {}
          } catch {}
        });
      }

      // remove video senders from pc (if removeTrack is supported)
      try {
        const senders = pc.getSenders ? pc.getSenders() : [];
        senders.forEach((s) => {
          if (s.track && s.track.kind === "video") {
            try {
              if ((pc as any).removeTrack) {
                (pc as any).removeTrack(s);
              } else {
                // fallback: replace with null/stop
                if (s.replaceTrack) s.replaceTrack(null as any).catch(() => {});
              }
            } catch (e) {
              console.warn("removeTrack failed", e);
            }
          }
        });
      } catch (e) {
        console.warn("downgradeFromVideo remove senders error", e);
      }

      // renegotiate to update remote about removed m-line
      if (active) {
        await sendRenegotiationOffer();
      }

      // mark false
      set({ videoEnabled: false });
    } catch (err) {
      console.error("downgradeFromVideo failed", err);
    }
  };

  const setLocalVideoEl = (el: HTMLVideoElement | null) => set({ localVideoEl: el });
  const setRemoteVideoEl = (el: HTMLVideoElement | null) => set({ remoteVideoEl: el });

  return {
    incomingCall: null,
    isCalling: false,
    inCall: false,
    muted: false,
    videoEnabled: false,
    remoteVideoEnabled: false,
    activeCall: null,
    pc: null,
    localStream: null,
    remoteStream: null,
    localVideoEl: null,
    remoteVideoEl: null,

    init,
    dispose,
    startCall,
    acceptCall,
    rejectCall,
    hangup,
    toggleMute,
    toggleVideo,
    setLocalVideoEl,
    setRemoteVideoEl,
  };
});

export default useCallStore;
