# SmashBanana 3DS - GameBanana Mod Manager (Game ID: 6364)

Homebrew client for **Super Smash Bros. for Nintendo 3DS** on Nintendo 3DS / New Nintendo 3DS.

## Project Structure
```text
SmashBanana/
├── Makefile            # devkitARM Makefile building .3dsx and .cia
├── template.rsf        # ROM spec file for makerom
├── resources/          # Icons, banners and audio
│   ├── icon.png        # 48x48 application icon
│   ├── banner.png      # 256x128 banner
│   └── banner.wav      # Short banner sound effect
├── romfs/              # Embedded assets (fonts, cacert.pem)
│   └── cacert.pem      # Mozilla CA certificates for HTTPS
├── include/            # C Header files
│   ├── common.h        # Constants, title IDs, colors
│   ├── ui.h            # Dual-screen Citro2D UI interface
│   └── api.h           # GameBanana API client definitions (game 6364)
└── source/             # C Source files
    ├── main.c          # Entry point, New 3DS speedup, event loop
    ├── ui.c            # Citro2D rendering for Top and Bottom displays
    └── api.c           # httpc + mbedTLS HTTPS request and JSON parser
```

## Prerequisites (devkitPro)
Install devkitPro with 3DS tools:
```bash
# Ubuntu / Debian
sudo apt-get install devkitarm-rules 3ds-dev
export DEVKITPRO=/opt/devkitpro
export DEVKITARM=$DEVKITPRO/devkitARM
```

## Compiling
```bash
# Build both .3dsx and .cia:
make

# Clean build:
make clean
```

## Installation on 3DS
- **.3dsx**: Copy to `sdmc:/3ds/SmashBanana/SmashBanana.3dsx` and launch via Homebrew Launcher.
- **.cia**: Copy to SD card and install using **FBI**.
