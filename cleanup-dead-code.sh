#!/bin/bash

# Dead Code Cleanup Script
# Created: 2026-02-27
# Purpose: Move unused files to backup directory

echo "🧹 Starting dead code cleanup..."

# Create backup directory with timestamp
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backup directory created: $BACKUP_DIR"

# Function to move file safely
move_to_backup() {
    local file="$1"
    if [ -f "$file" ]; then
        local dir=$(dirname "$file")
        mkdir -p "$BACKUP_DIR/$dir"
        mv "$file" "$BACKUP_DIR/$file"
        echo "  ✓ Moved: $file"
    else
        echo "  ⚠ Not found: $file"
    fi
}

# ============================================
# 1. UNUSED JAVASCRIPT FILES (~777 KB)
# ============================================
echo ""
echo "📂 Moving unused JavaScript files..."

move_to_backup "assets/js/custom.js"
move_to_backup "assets/js/custom-shuffle-init.js"
move_to_backup "assets/js/vendor.js"
move_to_backup "assets/js/jquery.shuffle.min.js"
move_to_backup "assets/js/imagesloaded.pkgd.js"
move_to_backup "assets/js/parallax.min.js"
move_to_backup "assets/js/photoswipe.min.js"
move_to_backup "assets/js/photoswipe-ui-default.min.js"
move_to_backup "assets/js/pswp.js"
move_to_backup "assets/js/textition.min.js"
move_to_backup "assets/js/contact.js"

# ============================================
# 2. UNUSED CSS FILES
# ============================================
echo ""
echo "🎨 Moving unused CSS files..."

move_to_backup "assets/css/custom.css"
move_to_backup "assets/css/vendor.css"
move_to_backup "assets/css/LineIcons.min.css"
move_to_backup "assets/css/photoswipe.min.css"
move_to_backup "assets/css/default-skin.min.css"
move_to_backup "assets/css/settings.css"

# Theme variants
move_to_backup "assets/css/theme-blue.css"
move_to_backup "assets/css/theme-darkblue.css"
move_to_backup "assets/css/theme-green.css"
move_to_backup "assets/css/theme-grey.css"
move_to_backup "assets/css/theme-pink.css"
move_to_backup "assets/css/theme-purple.css"
move_to_backup "assets/css/theme-red.css"
move_to_backup "assets/css/theme-yellow.css"

# ============================================
# 3. UNUSED VIDEOS
# ============================================
echo ""
echo "🎬 Moving unused video files..."

move_to_backup "assets/vd2.mp4"

# ============================================
# 4. UNUSED IMAGES
# ============================================
echo ""
echo "🖼️  Moving unused image files..."

move_to_backup "assets/thumbnail_1.png"
move_to_backup "assets/thumbnail_2.png"

# Avatar images
for i in {1..4}; do
    move_to_backup "assets/images/avatar-$i.png"
done

# SVG and PNG files
move_to_backup "assets/images/chevron-left.svg"
move_to_backup "assets/images/chevron-right.svg"
move_to_backup "assets/images/curve.png"
move_to_backup "assets/images/icon-quote.svg"
move_to_backup "assets/images/my-avatar.png"
move_to_backup "assets/images/pattern1.png"

# Pic files
for i in {1..3}; do
    move_to_backup "assets/images/pic-$i.png"
done

# Item files
for i in {1..8}; do
    move_to_backup "assets/images/item$i.png"
    move_to_backup "assets/images/item$i.svg"
done

move_to_backup "assets/images/AppStore-Icons.svg"

# ============================================
# 5. UNUSED FONTS
# ============================================
echo ""
echo "🔤 Moving unused font files..."

move_to_backup "assets/fonts/LineIcons.ttf"

# ============================================
# 6. UNUSED CSS ASSETS
# ============================================
echo ""
echo "🎨 Moving unused CSS assets..."

move_to_backup "assets/css/default-skin.png"

# ============================================
# 7. APK FILES (Optional - uncomment to move)
# ============================================
echo ""
echo "📱 APK files (skipped by default)"
echo "   Uncomment lines in script to move APK files"

# Uncomment these lines if you want to move APK files:
# move_to_backup "assets/apk/baby-three.apk"
# move_to_backup "assets/apk/blind-box.apk"
# move_to_backup "assets/apk/onet_v1.1.apk"
# move_to_backup "assets/apk/sodoku_v1.1.apk"
# move_to_backup "assets/apk/woodpuzzle_1.2.apk"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📊 Summary:"
du -sh "$BACKUP_DIR" 2>/dev/null || echo "Backup size: (calculating...)"
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Test your website thoroughly"
echo "   2. If everything works, you can delete: $BACKUP_DIR"
echo "   3. If issues occur, restore files from: $BACKUP_DIR"
echo ""
echo "🔄 To restore all files:"
echo "   cp -r $BACKUP_DIR/* ."
echo ""
