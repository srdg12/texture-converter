const texts = {
      }

      if (isORM) {
        const roughness = data[i + 1];
        const metallic = data[i + 2];

        data[i] = metallic;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255 - roughness;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    const outputName = isUnity
      ? file.name.replace(/\.[^/.]+$/, '_ORM.png')
      : file.name.replace(/\.[^/.]+$/, '_MetallicSmoothness.png');

    zip.file(outputName, blob);

    canvas.width = 1;
    canvas.height = 1;
  }

  const content = await zip.generateAsync({ type: 'blob' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'Converted_Textures.zip';
  link.click(
