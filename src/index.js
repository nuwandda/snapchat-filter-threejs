import "./styles.css";
import { PUBLIC_PATH } from './js/public_path';
import { VideoFrameProvider } from './js/video_frame_provider';
import { CameraFrameProvider } from './js/camera_frame_provider';
import { FacemeshLandmarksProvider } from './js/facemesh/landmarks_provider';
import { SceneManager } from "./js/three_components/scene_manager";

const template = `
<div class="video-container">
  <span class="loader">
    Loading ...
  </span>
  <div class="filtered_video">
    <canvas class="output_canvas"></canvas>
  </div>
  <div class="source_video">
    <h2>Original Video</h2>
    <video class="input_video" controls playsinline>
      <source  src="${PUBLIC_PATH}/video/videoplayback2.mp4">
    </video>
  </div>
</div>
`;

document.querySelector("#app").innerHTML = template;

async function main() {

  document.querySelector(".video-container").classList.add("loading");

  const video = document.querySelector('.input_video');
  const canvas = document.querySelector('.output_canvas');

  const useOrtho = true;
  const debug = false;

  let sceneManager;
  let facemeshLandmarksProvider;
  let videoFrameProvider;

  const onLandmarks = ({image, landmarks}) => {
    sceneManager.onLandmarks(image, landmarks);
  }

  const onFrame = async (video) => {
    try {
      await facemeshLandmarksProvider.send(video);
    } catch (e) {
      alert("There is a problem!")
      console.error(e);
      videoFrameProvider.stop();      
    }
  }

  function animate () {
    requestAnimationFrame(animate);
    sceneManager.resize(video.clientWidth, video.clientHeight);
    sceneManager.animate();
  }

  sceneManager = new SceneManager(canvas, debug, useOrtho);
  facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);

  if (confirm("Use Camera?")) {
    // Unload video
    video.pause();
    video.querySelector("source").remove();
    video.removeAttribute('src');
    video.load();

    videoFrameProvider = new CameraFrameProvider(video, onFrame);

  } else {

    videoFrameProvider = new VideoFrameProvider(video, onFrame);

  }
  
  await facemeshLandmarksProvider.initialize();
  videoFrameProvider.start();

  animate();

  document.querySelector(".video-container").classList.remove("loading");
}

main();
