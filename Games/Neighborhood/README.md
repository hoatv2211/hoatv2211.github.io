# Neighborhood Defense

`Neighborhood Defense` la game HTML5 duoc export tu Construct 3. Project nay khong co buoc build rieng: browser doc truc tiep `index.html`, runtime JavaScript, du lieu game va asset trong cac thu muc hien co.

## Chay nhanh

Chay file:

```bat
run.bat
```

Sau do mo game tai:

```text
http://localhost:8000
```

Khong nen double-click `index.html` de chay bang `file://`, vi browser se chan mot so tinh nang cua Construct export nhu module script, fetch/AJAX, service worker hoac asset loading.

## Yeu cau may

Can co Python tren Windows.

Kiem tra bang mot trong cac lenh:

```bat
py --version
python --version
```

Neu chua co Python, cai tu Microsoft Store hoac python.org, sau do chay lai `run.bat`.

## Cau truc project

```text
index.html                         Entry point cua game
style.css                          CSS nen cua Construct export
main.js                            Script nho cua ban/phien ban game
main.min.js                        Bundle da minify lien quan SDK/game
data.json                          Du lieu Construct lon: object, layout, event, asset map
level1.json                        Du lieu wave/level dang mang Construct C2
towerarcherdescription.json        Mo ta tower Archer
towerbombdescription.json          Mo ta tower Bomb
towerelectricdescription.json      Mo ta tower Electric/Ray
towersniperdescription.json        Mo ta tower Sniper
images/                            Sprite sheet va hinh anh webp
media/                             Am thanh/nhac dang webm
fonts/                             Font cua game
icons/                             Icon app/loading
scripts/                           Runtime Construct 3 va plugin
assets/css/                        CSS phu cho orientation/menu
```

## Luong chay chinh

1. Browser load `index.html`.
2. `index.html` nap CSS, Azerion SDK va Construct runtime.
3. `scripts/main.js` khoi tao Construct runtime HTML5.
4. Runtime nap `scripts/c3main.js`, `data.json`, images, media va font.
5. Game render len canvas va xu ly input qua Touch/Mouse.

## File nen sua

- Sua giao dien/runtime HTML wrapper: `index.html`, `style.css`.
- Sua asset: thay file trong `images/`, `media/`, `fonts/`, `icons/` voi cung ten file neu muon it rui ro.
- Sua level/wave ngoai: `level1.json`.
- Sua thong so tower neu game doc cac file nay: `towerarcherdescription.json`, `towerbombdescription.json`, `towerelectricdescription.json`, `towersniperdescription.json`.

## File nen can than

- `data.json` rat lon va la du lieu Construct export. Sua tay de gay loi neu khong biet format.
- `scripts/` la runtime da export. Thuong khong sua truc tiep tru khi can patch loi chay.
- `main.min.js` va `azerion-libs.js` da minify/obfuscate, kho doc va kho bao tri.

## Luu y hien tai

- `index.html` co tham chieu `appmanifest.json`, nhung file nay khong thay trong project. Game van co the chay, nhung browser co the bao loi 404 cho manifest local.
- `scripts/project/main.js` va `scripts/project/scriptsInEvents.js` hien co noi dung `Not found at origin!...`, co ve la artifact tu ban export/host cu. Runtime chinh dang dung `scripts/main.js` va `scripts/c3main.js`.
- Project hien khong phai git repository, nen khong co lich su commit trong thu muc nay.

## Chay thu cong neu khong dung run.bat

Tai thu muc project, chay:

```bat
py -m http.server 8000
```

Neu lenh `py` khong co:

```bat
python -m http.server 8000
```

Sau do mo:

```text
http://localhost:8000
```

