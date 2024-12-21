const fs = require('fs');
const path = require('path');

// manifest.json 파일 경로
const manifestPath = path.join(__dirname, '../dist/manifest.json');

function deleteIcons() {
    const iconSizes = [16, 32, 64, 128];
    iconSizes.forEach(size => {
        const iconPath = path.join(__dirname, `../dist/icons/appicon_purple_${size}.png`);

        // 파일 삭제
        if (fs.existsSync(iconPath)) {
            fs.unlinkSync(iconPath);
            console.log(`Deleted: ${iconPath}`);
        } else {
            console.log(`File not found: ${iconPath}`);
        }
    });
}

// manifest.json 파일 읽기 및 수정
fs.readFile(manifestPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading manifest.json:', err);
        return;
    }

    // JSON 파싱
    const manifest = JSON.parse(data);

    // 아이콘 변경
    manifest.action.default_icon = {
        "16": "icons/appicon_blue_16.png",
        "32": "icons/appicon_blue_32.png",
        "64": "icons/appicon_blue_64.png",
        "128": "icons/appicon_blue_128.png"
    };
    manifest.icons = {
        "128": "icons/appicon_blue_128.png"
    };

    // 변경된 manifest.json 파일 저장
    fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing manifest.json:', err);
            return;
        }
        console.log('Successfully transformed manifest.json for prod development.');

        // 아이콘 삭제
        deleteIcons();
        console.log('Deleted the icon for local build.');
    });
});
