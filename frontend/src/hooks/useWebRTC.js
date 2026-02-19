import { useState, useEffect, useRef, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function useWebRTC({ socket, roomId, localStream }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');
  const pcRef = useRef(null);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    return pc;
  }, [socket, roomId, localStream]);

  const startCall = useCallback(async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc:offer', { roomId, sdp: pc.localDescription });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, [createPeerConnection, socket, roomId]);

  const endCall = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState('closed');
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ sdp }) => {
      const pc = pcRef.current || createPeerConnection();
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { roomId, sdp: pc.localDescription });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    };

    const handleAnswer = async ({ sdp }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('call:ended', handleCallEnded);
    };
  }, [socket, roomId, createPeerConnection, endCall]);

  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  return { remoteStream, connectionState, startCall, endCall };
}
