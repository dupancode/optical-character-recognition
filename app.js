Vue.component('ocr-app', {
  template: `
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">Optical Character Recognition</h1>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="image-upload">Upload Image</label>
        <input type="file" id="image-upload" @change="handleImageUpload" accept="image/*"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500">
      </div>

      <div v-if="imageUrl" class="mb-6">
        <img :src="imageUrl" ref="image" alt="Uploaded" 
          class="max-w-full h-auto cursor-pointer rounded-lg shadow hover:shadow-lg transition"
          @click="initCropper" />
        <p class="text-sm text-gray-600 mt-2 text-center">Click the image to enable cropping</p>
      </div>

      <div v-if="isCropping" class="mb-6 text-center">
        <button @click="cropImage" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg mr-2">Crop Image</button>
        <button @click="cancelCrop" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
      </div>

      <div v-if="croppedImageUrl" class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Cropped Image:</h2>
        <img :src="croppedImageUrl" alt="Cropped" class="max-w-full h-auto rounded-lg shadow">
      </div>

      <button @click="convertToText"
        class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        :disabled="isConverting || !imageUrl">
        {{ isConverting ? 'Converting...' : 'Convert to Text' }}
      </button>

      <div v-if="convertedText" class="mt-4 p-4 bg-gray-100 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Converted Text:</h2>
        <p>{{ convertedText }}</p>
      </div>
    </div>
  `,
  data() {
    return {
      imageUrl: null,
      croppedImageUrl: null,
      convertedText: '',
      isConverting: false,
      isCropping: false,
      cropper: null
    };
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageUrl = e.target.result;
          this.croppedImageUrl = null;
          if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
          }
          this.isCropping = false;
        };
        reader.readAsDataURL(file);
      }
    },
    initCropper() {
      if (!this.cropper) {
        this.$nextTick(() => {
          this.cropper = new Cropper(this.$refs.image, {
            aspectRatio: NaN,
            viewMode: 1,
          });
          this.isCropping = true;
        });
      }
    },
    cropImage() {
      if (this.cropper) {
        this.croppedImageUrl = this.cropper.getCroppedCanvas().toDataURL();
        this.isCropping = false;
        this.cropper.destroy();
        this.cropper = null;
      }
    },
    cancelCrop() {
      if (this.cropper) {
        this.cropper.destroy();
        this.cropper = null;
      }
      this.isCropping = false;
      this.croppedImageUrl = null;
    },
    convertToText() {
      const imageToConvert = this.croppedImageUrl || this.imageUrl;
      if (!imageToConvert) {
        alert('Please upload an image first.');
        return;
      }
      
      this.isConverting = true;
      this.convertedText = '';
      
      Tesseract.recognize(imageToConvert)
        .then(({ data: { text } }) => {
          this.convertedText = text;
        })
        .catch(error => {
          console.error('Error during OCR:', error);
          this.convertedText = 'Error occurred during text conversion.';
        })
        .finally(() => {
          this.isConverting = false;
        });
    }
  }
});

new Vue({
  el: '#app'
});