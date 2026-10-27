# syntax=docker/dockerfile:1
# Dockerfile for 1-step compilation of SmashBanana into .3dsx and .cia binaries
FROM devkitpro/devkitarm:latest

# Install 3DS development toolchain and required homebrew libraries
RUN dkp-pacman -Syu --noconfirm \
    3ds-dev \
    3ds-libctru \
    3ds-citro2d \
    3ds-citro3d \
    3ds-mbedtls \
    3ds-zlib \
    makerom \
    bannertool \
    3dsxtool

WORKDIR /workspace

# Copy project source tree
COPY . .

# Build both .3dsx (Homebrew Launcher) and .cia (FBI Title)
CMD ["sh", "-c", "make clean && make -j$(nproc) && make cia && echo '== Build Complete! Created SmashBanana.3dsx & SmashBanana.cia =='"]
