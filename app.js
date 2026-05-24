// ... (이전 코드에서 이미지와 Canvas ctx를 가져온 상태라고 가정)

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// 원본 데이터를 오염시키지 않고 참조하기 위해 복사본(Uint8ClampedArray) 생성
const originalData = new Uint8ClampedArray(imageData.data); 
const data = imageData.data;

// 픽셀 배열은 [R, G, B, A, R, G, B, A...] 순서로 나열되어 있으므로 4씩 증가하며 루프
for (let i = 0; i < data.length; i += 4) {
    
    if (isORM) {
        // [언리얼 ORM -> 유니티 MetallicSmoothness 변환]
        // 원본 배열(originalData)에서 안전하게 채널 값을 읽어옵니다.
        const roughness = originalData[i + 1]; // Unreal G 채널 = Roughness
        const metallic = originalData[i + 2];  // Unreal B 채널 = Metallic
        
        // Unity 규격에 맞게 재할당
        data[i]     = metallic;                // Unity R 채널 = Metallic
        data[i + 1] = 0;                       // Unity G 채널 = 빈값 (0)
        data[i + 2] = 0;                       // Unity B 채널 = 빈값 (0)
        data[i + 3] = 255 - roughness;         // Unity A 채널 = Smoothness (1 - Roughness)
    } else {
        // [유니티 MetallicSmoothness -> 언리얼 ORM 변환] (반대 케이스가 필요할 경우)
        const metallic = originalData[i];      // Unity R 채널 = Metallic
        const smoothness = originalData[i + 3]; // Unity A 채널 = Smoothness
        
        data[i]     = 0;                       // Unreal R 채널 = AO (기본값 0 또는 255)
        data[i + 1] = 255 - smoothness;        // Unreal G 채널 = Roughness (1 - Smoothness)
        data[i + 2] = metallic;                // Unreal B 채널 = Metallic
        data[i + 3] = 255;                     // Unreal A 채널 = 불투명 (255)
    }
}

// 수정된 픽셀 데이터를 캔버스에 다시 적용
ctx.putImageData(imageData, 0, 0);

// 압축 및 다운로드 처리 블록
const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
});

// 삼항 연산자를 사용한 파일 네이밍 규칙 정립
const outputName = isUnity 
    ? file.name.replace(/\.[^.]+$/, '_ORM.png') 
    : file.name.replace(/\.[^.]+$/, '_MetallicSmoothness.png');

zip.file(outputName, blob);

// 가속 및 메모리 관리를 위한 캔버스 초기화
canvas.width = 1;
canvas.height = 1;

// ZIP 인코딩 및 최종 다운로드 트리거
const content = await zip.generateAsync({ type: 'blob' });
const link = document.createElement('a');
link.href = URL.createObjectURL(content);
link.download = 'Converted_Textures.zip';
link.click();
