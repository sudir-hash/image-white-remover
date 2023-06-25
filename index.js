// Install the necessary packages: express, multer, and jimp
const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const gm=require('gm');


const app = express();
const upload = multer({ dest: 'uploads/' });


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'));


// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle the file upload
//converts white background to transparent
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Read the uploaded image using Jimp
    const image = await Jimp.read(req.file.path);

    // Iterate over each pixel in the image and remove white pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      if (red === 255 && green === 255 && blue === 255 && alpha === 255) {
        this.bitmap.data[idx + 3] = 0; // Set the alpha channel to 0 to make it transparent
      }
    });

    // Crop the image to remove the white portion
    image.autocrop();

   

    // Save the cropped image
    const outputPath = `uploads/cropped_${req.file.filename}.png`;
    await image.writeAsync(outputPath);

    

    // Return the cropped image path
    // res.json({ imagePath: outputPath });
    console.log(__dirname+'/' + outputPath)

    res.download(__dirname+'/' + outputPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});




// ...

// Handle the file upload
// crops the transparent background
app.post('/upload2', upload.single('image'), async (req, res) => {
    try {
      // Read the uploaded image using Jimp
      const image = await Jimp.read(req.file.path);
      // Save the cropped image
      const outputPath = `uploads/cropped_${req.file.filename}.png`;

      await image.writeAsync(outputPath);


      gm(outputPath)
      .trim()
        .write(outputPath, function (err) { 
            if (!err) console.log('done');
            else console.log(err)
        });
        
        
  
      // Return the cropped image path
      res.download(__dirname+'/' + outputPath);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  // ...
  

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
