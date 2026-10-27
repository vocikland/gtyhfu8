#---------------------------------------------------------------------------------
# SmashBanana 3DS - GameBanana Client for Super Smash Bros. 3DS (ID: 6364)
# Makefile for devkitARM / devkitPro
# Builds both .3dsx (Homebrew Launcher) and .cia (Installable via FBI)
#---------------------------------------------------------------------------------

.SUFFIXES:

ifeq ($(strip $(DEVKITARM)),)
$(error "Please set DEVKITARM in your environment. export DEVKITARM=<path to>devkitARM")
endif

include $(DEVKITARM)/3ds_rules

#---------------------------------------------------------------------------------
# TARGET CONFIGURATION
#---------------------------------------------------------------------------------
TARGET          := SmashBanana
BUILD           := build
SOURCES         := source
INCLUDES        := include
DATA            := data
ROMFS           := romfs
RESOURCES       := resources

# App metadata for 3DSX SMDH and CIA Banner
APP_TITLE       := SmashBanana 3DS
APP_DESCRIPTION := GameBanana Mod Client for Smash 3DS
APP_AUTHOR      := Homebrew Community
APP_VERSION     := 1.0.0
APP_PRODUCT_CODE:= CTR-P-SMBN
APP_UNIQUE_ID   := 0xF6364

# Tool binaries from devkitPro
MAKEROM         := makerom
BANNERTOOL      := bannertool

#---------------------------------------------------------------------------------
# COMPILER & LINKER FLAGS
#---------------------------------------------------------------------------------
ARCH    := -march=armv6k -mtune=mpcore -mfloat-abi=hard -mtp=soft

CFLAGS  := -g -Wall -O2 -mword-relocations \
           -fomit-frame-pointer -ffunction-sections \
           $(ARCH)

CFLAGS  += $(INCLUDE) -DARM11 -D_3DS -DAPP_VERSION="\"$(APP_VERSION)\""

CXXFLAGS:= $(CFLAGS) -fno-rtti -fno-exceptions -std=gnu++20
ASFLAGS := -g $(ARCH)

# Libraries: citro2d (UI), citro3d (GPU), ctru (3DS OS kernel & httpc), zlib/minizip (ZIP extract), quirc (QR camera)
LIBS    := -lcitro2d -lcitro3d -lctru -lquirc -lz -lm

LIBDIRS := $(PORTLIBS) $(CTRULIB)

#---------------------------------------------------------------------------------
# OBJECTS & SOURCES
#---------------------------------------------------------------------------------
ifneq ($(BUILD),$(notdir $(CURDIR)))

export OUTPUT   := $(CURDIR)/$(TARGET)
export TOPDIR   := $(CURDIR)

export VPATH    := $(foreach dir,$(SOURCES),$(CURDIR)/$(dir)) \
                   $(foreach dir,$(DATA),$(CURDIR)/$(dir))

export DEPSDIR  := $(CURDIR)/$(BUILD)

CFILES      := $(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.c)))
CPPFILES    := $(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.cpp)))
sFILES      := $(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.s)))
SFILES      := $(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.S)))

export OFILES   := $(addsuffix .o,$(BINFILES)) \
                   $(CPPFILES:.cpp=.o) $(CFILES:.c=.o) \
                   $(sFILES:.s=.o) $(SFILES:.S=.o)

export INCLUDE  := $(foreach dir,$(INCLUDES),-I$(CURDIR)/$(dir)) \
                   $(foreach dir,$(LIBDIRS),-I$(dir)/include) \
                   -I$(CURDIR)/$(BUILD)

export LIBPATHS := $(foreach dir,$(LIBDIRS),-L$(dir)/lib)

.PHONY: all clean

#---------------------------------------------------------------------------------
# BUILD RULES
#---------------------------------------------------------------------------------
all: $(BUILD) $(OUTPUT).3dsx $(OUTPUT).cia

$(BUILD):
	@[ -d $@ ] || mkdir -p $@

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD) $(OUTPUT).3dsx $(OUTPUT).smdh $(OUTPUT).elf $(OUTPUT).cia $(OUTPUT).bnr $(OUTPUT).icn

# Re-enter Makefile in build folder
$(OUTPUT).elf: $(BUILD)
	@$(MAKE) --no-print-directory -C $(BUILD) -f $(CURDIR)/Makefile

# Build 3DSX (Homebrew Launcher)
$(OUTPUT).3dsx: $(OUTPUT).elf $(OUTPUT).smdh
	@3dsxtool $< $@ --smdh=$(OUTPUT).smdh $(if $(wildcard $(ROMFS)),--romfs=$(ROMFS))
	@echo "Built: $@"

# Build SMDH Icon and Title metadata
$(OUTPUT).smdh: $(RESOURCES)/icon.png
	@smdhtool --create "$(APP_TITLE)" "$(APP_DESCRIPTION)" "$(APP_AUTHOR)" $< $@

# Build Banner & Icon for CIA
$(OUTPUT).bnr: $(RESOURCES)/banner.png $(RESOURCES)/banner.wav
	@$(BANNERTOOL) makebanner -i $(RESOURCES)/banner.png -a $(RESOURCES)/banner.wav -o $@

$(OUTPUT).icn: $(RESOURCES)/icon.png
	@$(BANNERTOOL) makeicn -i $< -o $@

# Build CIA (FBI Installable package using makerom and RSF template)
$(OUTPUT).cia: $(OUTPUT).elf $(OUTPUT).bnr $(OUTPUT).icn template.rsf
	@$(MAKEROM) -f cia -o $@ -elf $(OUTPUT).elf -rsf template.rsf \
		-banner $(OUTPUT).bnr -icon $(OUTPUT).icn \
		-major 1 -minor 0 -micro 0 \
		$(if $(wildcard $(ROMFS)),-romfs $(ROMFS))
	@echo "Built: $@"

else

#---------------------------------------------------------------------------------
# INTERNAL COMPILATION (Running within build directory)
#---------------------------------------------------------------------------------
DEPENDS := $(OFILES:.o=.d)

$(OUTPUT).elf: $(OFILES)
	@echo "Linking $(notdir $@)..."
	@$(CC) $(ARCH) $(OFILES) $(LIBPATHS) $(LIBS) -o $@

-include $(DEPENDS)

%.o: %.c
	@echo "Compiling $<..."
	@$(CC) -MMD -MP -MF $(DEPSDIR)/$*.d $(CFLAGS) -c $< -o $@

%.o: %.cpp
	@echo "Compiling $<..."
	@$(CXX) -MMD -MP -MF $(DEPSDIR)/$*.d $(CXXFLAGS) -c $< -o $@

endif
