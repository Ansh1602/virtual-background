// 1. Install dependencies
// 2. Import dependencies
// 3. Setup webcam and canvas
// 4. Define references to those
// 5. Load handpose
// 6. Detect function
// 7. Draw using drawMask

import React, { useEffect, useRef } from "react";
// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";
import bg1 from './bg1.jpg'
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {

    contextRef.current = canvasRef2.current.getContext("2d");
    canvasRef2.current.width = 640;
    canvasRef2.current.height = 480;

    // ctx.fillStyle = 'red'
    // ctx.fillRect(0, 0, canvasRef2.current.width, canvasRef2.current.height);

    // ctx.clearRect(0, 0, canvasRef2.current.width, canvasRef2.current.height);

  }, [])

  const detect2 = async (net) => {
    // contextRef.current.fillStyle = 'red'
    // contextRef.current.fillRect(0, 0, canvasRef2.current.width, canvasRef2.current.height);

    const video = webcamRef.current.video;

    contextRef.current.clearRect(
      0,
      0,
      canvasRef2.current.width,
      canvasRef2.current.height
    );

    contextRef.current.drawImage(
      video,
      0,
      0,
      canvasRef2.current.width,
      canvasRef2.current.height
    )

    const segmentationWidth = 640;
    const segmentationHeight = 480;
    const segmentationPixelCount = segmentationWidth * segmentationHeight;
    const segmentationMask = new ImageData(segmentationWidth, segmentationHeight);


    const segmentation = await net.segmentPerson(video);
    for (let i = 0; i < 307200; i++) {
      // Sets only the alpha component of each pixel
      segmentationMask.data[i * 6 + 4] = segmentation.data[i] ? 255 : 0;
    }
    contextRef.current.putImageData(segmentationMask, 0, 0);

    contextRef.current.clearRect(0,0,canvasRef2.current.width,canvasRef2.current.height);

    contextRef.current.globalCompositeOperation = "copy";
    contextRef.current.filter = "none";

    contextRef.current.drawImage(bg1, 0, 0, canvasRef2.current.width, canvasRef2.current.height);

    requestAnimationFrame(detect2)
  }

  const runBodysegment = async () => {
    const net = await bodyPix.load();
    console.log("BodyPix model loaded.");

    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);

    // const repeat = () => {
    //   requestAnimationFrame(detect)
    // }
    // detect(net)

  };




  const detect = async (net) => {



    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      // * One of (see documentation below):
      // *   - net.segmentPerson
      // *   - net.segmentPersonParts
      // *   - net.segmentMultiPerson
      // *   - net.segmentMultiPersonParts
      // const segmentation = await net.segmentPerson(video);
      const segmentation = await net.segmentPerson(video);
      // console.log(segmentation);

      // const coloredPartImage = bodyPix.toMask(segmentation);
      const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
      const backgroundColor = { r: 0, g: 255, b: 0, a: 255 };
      const coloredPartImage = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
      const opacity = 0.7;
      const flipHorizontal = false;
      const maskBlurAmount = 3;
      const canvas = canvasRef.current;

      bodyPix.drawMask(
        canvas,
        video,
        coloredPartImage,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );

      detect2(net)
      // console.log("detect")
    }
  };

  runBodysegment();

  return (
    <div className="App">
      <header className="App-header">
        <canvas
          ref={canvasRef2}
          style={{
            // position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        <Webcam
          ref={webcamRef}
          style={{
            // position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            // position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;