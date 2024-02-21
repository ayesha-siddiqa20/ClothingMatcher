document.addEventListener('DOMContentLoaded', (event) => {
  const video = document.querySelector(".video");
  const container = document.querySelector(".container")
  const cameraButton = document.querySelector(".camera");
  const canvas = document.createElement('canvas'); // Create a canvas element
  let storedTops = localStorage.getItem('tops');
  let storedBottoms = localStorage.getItem('bottoms');

  if (storedTops) {
    tops = JSON.parse(storedTops);
  } 
  else {
      // If no stored data, use initial data and save it
    tops = [
        { image: "top1.png", color: "white" },
        { image: "top2.png", color: "black" },
        { image: "top3.png", color: "brown" }
    ];
    localStorage.setItem('tops', JSON.stringify(tops));
  }

  if (storedBottoms) {
      bottoms = JSON.parse(storedBottoms);
  } else {
      // If no stored data, use initial data and save it
      bottoms = [
          { image: "bottom1.png", color: "white" },
          { image: "bottom2.png", color: "green" },
          { image: "bottom3.png", color: "white" }
      ];
      localStorage.setItem('bottoms', JSON.stringify(bottoms));
  }
  // Set canvas size
  canvas.width = 640;
  canvas.height = 480;
  
  const startCameraButton = document.getElementById('start-camera');

  startCameraButton.addEventListener('click', () => {
    // Check if video is already showing
    if (video.style.display === 'none') {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.style.display = 'block'; // Show the video element
                container.style.display = 'block';
                startCameraButton.textContent = 'Hide Camera'; // Change button text
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
            });
    } else {
        video.style.display = 'none'; // Hide the video element
        container.style.display = 'none';
        video.srcObject.getTracks().forEach(track => track.stop()); // Stop the camera
        startCameraButton.textContent = 'Start Camera'; // Change button text back
    }
});

  // navigator.mediaDevices.getUserMedia({ video: true })
  //   .then(stream => {
  //     video.srcObject = stream;
  //     video.play();
  //   })
  //   .catch(error => {
  //     console.error('Error accessing the camera:', error);
  //   });

  // Event listener for the camera button
  cameraButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // Draw the video frame to the canvas.
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a Blob
    canvas.toBlob(blob => {
      sendImageToServer(blob);
    }, 'image/jpeg');
  });
});

function handleServerResponse(data) {
  // Assuming 'data' is the object returned from the server with properties:
  // { filePath: 'path/to/uploaded/image.png', color: 'red', type: 'top' }
  
  // Create an object representing the new clothing item
  let newItem = {
      image: data.filePath, // Use the path provided by the server
      color: data.color
  };

  // Determine if the new item is a top or bottom and add it to the appropriate array
  if (data.type === 'top') {
      tops.push(newItem);
  } else if (data.type === 'bottom') {
      bottoms.push(newItem);
  }

  // Optionally, update the UI to reflect the new item
  // updateUI();
}

function sendImageToServer(blob) {
  const formData = new FormData();
  formData.append('cameraImage', blob, 'camera.jpg');
  const color = document.getElementById('color-type').value;
  const clothingType = document.getElementById('clothing-type').value;
  formData.append('color', color);
  formData.append('type', clothingType);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // Assuming data.filePath is the path to the uploaded image
    if (data.type === 'top') {
        tops.push({ image: data.filePath, color: data.color });
        localStorage.setItem('tops', JSON.stringify(tops)); // Store updated array
    } else if (data.type === 'bottom') {
        bottoms.push({ image: data.filePath, color: data.color });
        localStorage.setItem('bottoms', JSON.stringify(bottoms)); // Store updated array
    }
    updateUI();
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function updateUI() {
  // Clear existing images
  document.getElementById('top-clothing').innerHTML = '';
  document.getElementById('bottom-clothing').innerHTML = '';

  // Append new images to the top clothing section
  tops.forEach(item => {
      const imgElement = document.createElement('img');
      imgElement.src = item.image; // Assuming item.image is a path to the image
      imgElement.alt = "Top Clothing";
      imgElement.style.maxWidth = "200px";
      imgElement.style.height = "auto";
      document.getElementById('top-clothing').appendChild(imgElement);
  });

  // Append new images to the bottom clothing section
  bottoms.forEach(item => {
      const imgElement = document.createElement('img');
      imgElement.src = item.image; // Assuming item.image is a path to the image
      imgElement.alt = "Bottom Clothing";
      imgElement.style.maxWidth = "200px";
      imgElement.style.height = "auto";
      document.getElementById('bottom-clothing').appendChild(imgElement);
  });
}
