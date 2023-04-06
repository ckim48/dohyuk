// Getting access to the video element that we created in main.html
let video2 = document.getElementById("video2");
const accessCamera2 = () => {
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: { width: 400, height: 300 }
        })
        .then((stream) => {
            video2.srcObject = stream;
        })
};

accessCamera2();

let video = document.getElementById("video");
let model;
let emotionModel;
let model2;
let emotionModel2;
const emotions = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'];

let canvas = document.getElementById("canvas"); // Get the canvas element from html
let ctx = canvas.getContext("2d"); // Allows us to actually draw on the canvas

let canvas2 = document.getElementById("canvas2"); // Get the canvas element from html
let ctx2 = canvas2.getContext("2d"); // Allows us to actually draw on the canvas

const accessCamera = () => {
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: { width: 500, height: 400 }
        })
        .then((stream) => {
            video.srcObject = stream;
        })
};

const predictEmotion = async(points) => {
    let result = tf.tidy(() => {
        const xs = tf.stack([tf.tensor1d(points)]);
        return emotionModel.predict(xs);
    });
    let prediction = await result.data();
    result.dispose();
    // Get the index of the maximum value
    let id = prediction.indexOf(Math.max(...prediction));
    return emotions[id];
}

const predictEmotion2 = async(points) => {
    let result = tf.tidy(() => {
        const xs = tf.stack([tf.tensor1d(points)]);
        return emotionModel2.predict(xs);
    });
    let prediction = await result.data();
    result.dispose();
    // Get the index of the maximum value
    let id = prediction.indexOf(Math.max(...prediction));
    return emotions[id];
}

const detectFaces = async() => {
    const prediction = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false
    });

    ctx.drawImage(video, 0, 0, 500, 400);
    // const prediction = await model.estimateFaces(video, false);
    // We are going to draw the predictions on the canvas



    prediction.forEach(async(predictions) => {
        // Draw a rectangle around the predicted face
        ctx.beginPath() // Start the drawing process
        ctx.lineWidth = "4";
        ctx.strokeStyle = "red";

        const x1 = predictions.boundingBox.topLeft[0];
        const y1 = predictions.boundingBox.topLeft[1];
        const x2 = predictions.boundingBox.bottomRight[0];
        const y2 = predictions.boundingBox.bottomRight[1];
        const bWidth = x2 - x1;
        const bHeight = y2 - y1;
        ctx.rect(
            x1,
            y1,
            bWidth,
            bHeight
        );
        ctx.stroke();

        const features = [
            "noseTip",
            "leftCheek",
            "rightCheek",
            "leftEyeLower1", "leftEyeUpper1",
            "rightEyeLower1", "rightEyeUpper1",
            "leftEyebrowLower",
            "rightEyebrowLower",
            "lipsLowerInner",
            "lipsUpperInner"
        ];
        points = [];
        features.forEach(feature => {
            predictions.annotations[feature].forEach(x => {
                points.push((x[0] - x1) / bWidth);
                points.push((x[1] - y1) / bHeight);
            })
        });
        if(points) {
            // Emotion predictions
            let emotion = await predictEmotion(points);
            document.getElementById("emotion_text").innerText=emotion;
        }
    })
}

const detectFaces2 = async() => {
    const prediction = await model2.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false
    });

    ctx2.drawImage(video, 0, 0, 500, 400);
    // const prediction = await model.estimateFaces(video, false);
    // We are going to draw the predictions on the canvas



    prediction.forEach(async(predictions) => {
        // Draw a rectangle around the predicted face
        ctx2.beginPath() // Start the drawing process
        ctx2.lineWidth = "4";
        ctx2.strokeStyle = "red";

        const x1 = predictions.boundingBox.topLeft[0];
        const y1 = predictions.boundingBox.topLeft[1];
        const x2 = predictions.boundingBox.bottomRight[0];
        const y2 = predictions.boundingBox.bottomRight[1];
        const bWidth = x2 - x1;
        const bHeight = y2 - y1;
        ctx2.rect(
            x1,
            y1,
            bWidth,
            bHeight
        );
        ctx2.stroke();

        const features = [
            "noseTip",
            "leftCheek",
            "rightCheek",
            "leftEyeLower1", "leftEyeUpper1",
            "rightEyeLower1", "rightEyeUpper1",
            "leftEyebrowLower",
            "rightEyebrowLower",
            "lipsLowerInner",
            "lipsUpperInner"
        ];
        points = [];
        features.forEach(feature => {
            predictions.annotations[feature].forEach(x => {
                points.push((x[0] - x1) / bWidth);
                points.push((x[1] - y1) / bHeight);
            })
        });
        if(points) {
            // Emotion predictions
            let emotion = await predictEmotion2(points);
            document.getElementById("emotion_text2").innerText= emotion.toUpperCase();
        }
    })
}

accessCamera();

video.addEventListener("loadeddata", async() => {
    // model = await blazeface.load();
    // setInterval(detectFaces, 40)
    model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    emotionModel = await tf.loadLayersModel('web/model/facemo.json');
    setInterval(detectFaces, 500);
    // detectFaces();
});

video2.addEventListener("loadeddata", async() => {
    model2 = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    emotionModel2 = await tf.loadLayersModel('web/model/facemo.json');
    setInterval(detectFaces2, 40);
})