(function() {
  let originalImage, previewImage, ogRatio, blobURL, isNa;
  const $ = (selector) => document.querySelector(selector);

  const setNaturalDimension = () => {
    const { naturalWidth, naturalHeight } = originalImage;
    ogRatio = naturalWidth / naturalHeight;
    $("#width").value = naturalWidth;
    $("#height").value = naturalHeight;
    $(".original-dimension").textContent = $(".resized-dimension").textContent = `${naturalWidth} x ${naturalHeight}`;
  };

  const sizeFormat = (bytes) => {
    let kb = Math.floor(bytes / 1024 * 100) / 100;
    return kb >= 1024 ? (Math.floor(kb / 1024 * 100) / 100) + " MB" : kb + " KB";
  };

  $("#filepicker").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (!file) return; 

    blobURL = URL.createObjectURL(file);
    originalImage = new Image();
    originalImage.src = blobURL;
    previewImage = originalImage.cloneNode(); 

    $(".preview").innerHTML = "";
    $(".preview").appendChild(previewImage);

    $(".original-size").textContent = $(".cur-size").textContent = sizeFormat(file.size);
    $(".compressed-size").textContent = "N/A";
    $(".quality-level").textContent = "100%";
    $("#compressor").value = 1;

    originalImage.onload = setNaturalDimension;
    isNa = true;
  });

  const resizeAndCompress = (isCompressingEvent) => {
    let canvas = document.createElement("canvas");
    let quality = +$("#compressor").value;
    let ctx = canvas.getContext("2d");

    canvas.width = $("#width").value;
    canvas.height = $("#height").value;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      let compressing = isCompressingEvent instanceof Event ? true : isCompressingEvent;
      
      if (!isNa || compressing) $(".compressed-size").textContent = sizeFormat(blob.size);
      $(".cur-size").textContent = sizeFormat(blob.size); 

      blobURL = URL.createObjectURL(blob);

      if (compressing) {
        $(".quality-level").textContent = Math.round(quality * 100) + "%";
        previewImage.src = blobURL;
        isNa = false;
      }
    }, "image/jpeg", quality);
  };

  $("#compressor").addEventListener("input", resizeAndCompress);
  
  $("#reset").addEventListener("click", () => {
    setNaturalDimension();
    resizeAndCompress(true);
  });

  const updateResizeDimension = () => {
    $(".resized-dimension").textContent = `${$("#width").value} x ${$("#height").value}`;
    resizeAndCompress(false);
  };

  $("#width").addEventListener("input", () => {
    if ($("#ratio").checked) $("#height").value = Math.floor($("#width").value / ogRatio);
    updateResizeDimension();
  });

  $("#height").addEventListener("input", () => {
    if ($("#ratio").checked) $("#width").value = Math.floor($("#height").value * ogRatio);
    updateResizeDimension();
  });

  $("#download").addEventListener("click", () => {
    if (!blobURL) {
      alert("Please upload and compress an image first!");
      return;
    }

    try {
      let link = document.createElement("a");
      link.href = blobURL;
      link.download = `compressed_${Date.now()}.jpg`; 
      
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
      
    } catch (error) {
      alert("Your online code runner blocked the automatic download. Just right-click the preview image and select 'Save image as...' instead!");
    }
  });
})();