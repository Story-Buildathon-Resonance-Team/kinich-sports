export class NativeCompressionService {
  /**
   * Compresses a video file using the browser's native MediaRecorder API.
   * Returns a File object ready for upload to Supabase Storage.
   * 
   * @param file - The original video File object
   * @param onProgress - Optional callback for compression progress (0-100)
   * @returns Promise<File> - A compressed video file (usually .webm or .mp4)
   */
  public static async compressVideo(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;
      video.muted = true; // Required to autoplay without user interaction
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      // Supabase/Web Optimization Settings
      const TARGET_HEIGHT = 720;
      const TARGET_BITRATE = 1500000; // 1.5 Mbps (Good balance for 720p web playback)
      const FPS = 30;

      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.height = TARGET_HEIGHT;
        canvas.width = Math.round(TARGET_HEIGHT * aspectRatio);

        // Create stream from canvas
        const stream = canvas.captureStream(FPS);

        // Determine supported mime type with preference for WebM (efficient for web)
        let mimeType = 'video/webm;codecs=vp8';
        let extension = 'webm';

        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          extension = 'webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4'; // Safari fallback
          extension = 'mp4';
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: TARGET_BITRATE
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          URL.revokeObjectURL(fileUrl);

          // Create a File object suitable for Supabase upload
          // Naming convention: original_name_compressed.extension
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const fileName = `${originalName}_compressed.${extension}`;
          const compressedFile = new File([blob], fileName, { type: mimeType });

          resolve(compressedFile);
        };

        mediaRecorder.onerror = (e) => {
          URL.revokeObjectURL(fileUrl);
          reject((e as { error?: Error }).error || new Error("MediaRecorder error"));
        };

        // Start processing
        mediaRecorder.start();

        // Speed up playback for faster processing
        // 2.0x is usually safe on most devices without dropping frames
        video.playbackRate = 2.0;

        video.play().catch(reject);

        const draw = () => {
          if (video.paused || video.ended) return;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (onProgress && video.duration) {
            const percent = Math.round((video.currentTime / video.duration) * 100);
            onProgress(Math.min(percent, 99));
          }

          if (!video.ended) {
            requestAnimationFrame(draw);
          }
        };

        video.onplay = () => draw();

        video.onended = () => {
          // Ensure we capture the last bit
          mediaRecorder.stop();
          if (onProgress) onProgress(100);
        };
      };

      video.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        reject(new Error("Failed to load video file"));
      };
    });
  }
}
