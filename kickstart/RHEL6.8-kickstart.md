---------------------------------------------------------------ks.cfg文件------------------------------------------------------------------------
# Kickstart file automatically generated by anaconda.
#platform=x86, AMD64, 或 Intel EM64T
#version=DEVEL
# Install OS instead of upgrade
install
# Keyboard layouts
keyboard us
# Network configure
network --onboot yes --device eth0 --bootproto dhcp --noipv6
# network --onboot yes --device eth1 --bootproto dhcp --noipv6
# Root password
rootpw --iscrypted $1$H958Ihnm$G27zAUD4pq8nQ8D/tT.72/
# System language
lang zh_CN.UTF-8
# Firewall configuration
firewall --disabled
# System authorization information
auth  --useshadow  --passalgo=sha512
# Use CDROM installation media
cdrom
# Use text mode install
# text
graphical
firstboot --disable
# SELinux configuration
selinux --disabled
key --skip

# Reboot after installation
reboot
# System timezone
timezone --utc Asia/Shanghai
# System bootloader configuration
bootloader --location=mbr --driveorder=sda --append="crashkernel=auto rhgb quiet"
# Clear the Master Boot Record
# zerombr
# Partition clearing information
clearpart --all --initlabel
# Disk partitioning information
part /boot --fstype=ext4 --ondisk=sda --size=300
part pv.01 --ondisk=sda --grow --size=200

volgroup vg_system --pesize=4096 pv.01
logvol swap --name=lv_swap --vgname=vg_system --size=16384
logvol /home --fstype=ext4 --name=lv_home --vgname=vg_system --size=51200
logvol /var --fstype=ext4 --name=lv_var --vgname=vg_system --size=51200
logvol / --fstype=ext4 --name=lv_root --vgname=vg_system --size=102400
logvol /opt --fstype=ext4 --name=lv_opt --vgname=vg_system --size=51200 --grow


%packages
@base
@chinese-support
@client-mgmt-tools
@core
@debugging
@basic-desktop
@desktop-debugging
@desktop-platform
@directory-client
@fonts
@general-desktop
@graphical-admin-tools
@input-methods
@internet-browser
@java-platform
@legacy-x
@network-file-system-client
@perl-runtime
@print-client
@remote-desktop-clients
@server-platform
@server-policy
@x11
mtools
pax
python-dmidecode
oddjob
wodim
sgpio
genisoimage
device-mapper-persistent-data
abrt-gui
samba-winbind
certmonger
pam_krb5
krb5-workstation
libXmu
perl-DBD-SQLite

# %pre
# mkdir /tmp/custom_rpms
# mkdir /tmp/iso
# cp -R /mnt/source/custom/rpms/* /tmp/custom_rpms
# cp -R /mnt/source/* /tmp/iso
# cp -R /mnt/source/custom/rhel6.8.repo /tmp

# %post --nochroot
# rpm -ivh --root=/mnt/sysimage /tmp/custom_rpms/*.rpm
# mkdir /mnt/sysimage/mnt/iso
# cp -R /tmp/iso/* /mnt/sysimage/mnt/iso
# rm -rf /mnt/sysimage/etc/yum.repos.d/*
# cp -R /tmp/rhel6.8.repo /mnt/sysimage/etc/yum.repos.d/

%post --nochroot
echo 'PS1="\[\033[0;34m\][\[\033[0;32m\]\A \[\033[0;31m\]\u\[\033[0;34m\]@\[\033[0;35m\]\h\[\033[0;34m\]:\[\033[0;36m\]\W \[\033[0;32m\]\#\[\033[0;34m\]]\[\033[0;33m\]\\$\[\033[0m\]"' >> /mnt/sysimage/etc/profile
mount -t auto /dev/cdrom /mnt/source
mkdir -p /mnt/sysimage/mnt/iso
cp -R /mnt/source/* /mnt/sysimage/mnt/iso 
rm -rf /mnt/sysimage/etc/yum.repos.d/*
cp -R /mnt/source/custom/rhel6.8.repo /mnt/sysimage/etc/yum.repos.d/
cp -R /mnt/source/custom/xis /mnt/sysimage/usr/local/bin/

%post
chmod a+x /usr/local/bin/xis

%end



---------------------------------------------------------------isolinux.cfg文件------------------------------------------------------------------------
# default vesamenu.c32
# default ks
# prompt 1
default vesamenu.c32
# prompt 1
timeout 100

display boot.msg
# display boot.txt

menu background splash.jpg
menu title Welcome to Red Hat Enterprise Linux 6.8 for HRBank!
menu color border 0 #ffffffff #00000000
menu color sel 7 #ffffffff #ff000000
menu color title 0 #ffffffff #00000000
menu color tabmsg 0 #ffffffff #00000000
menu color unsel 0 #ffffffff #00000000
menu color hotsel 0 #ff000000 #ffffffff
menu color hotkey 7 #ffffffff #ff000000
menu color scrollbar 0 #ffffffff #00000000

label linux
  menu label ^Install or upgrade an existing system
# menu default
  kernel vmlinuz
  append initrd=initrd.img
label vesa
  menu label Install system with ^basic video driver
  kernel vmlinuz
  append initrd=initrd.img nomodeset
label ks
  menu label Install system with kickstart
  menu default
  kernel vmlinuz
  append ks ks=cdrom:/custom/ks.cfg initrd=initrd.img
label rescue
  menu label ^Rescue installed system
  kernel vmlinuz
  append initrd=initrd.img rescue
label local
  menu label Boot from ^local drive
  localboot 0xffff
label memtest86
  menu label ^Memory test
  kernel memtest
  append -



---------------------------------------------------------------镜像生成命令------------------------------------------------------------------------
[15:16 root@odm:source 11]#mkisofs -R -b isolinux/isolinux.bin -c isolinux/boot.cat -V RHEL-6.8-HRBank -no-emul-boot -boot-load-size 4 -boot-info-table -o ../RHEL-6.8-HRbank.iso .



---------------------------------------------------------------备注------------------------------------------------------------------------
[A]、目录结构：
[15:18 root@odm:custom-iso 71]#tree
.
└── source
    ├── custom
    │   ├── ks.cfg
    ├── EFI
    │   └── BOOT
    │       ├── BOOTX64.conf
    │       ├── BOOTX64.efi
    │       ├── splash.xpm.gz
    │       └── TRANS.TBL
    ├── EULA
    ├── EULA_de
    ..........


[B]、本说明适用于RHEL6系列，RHEL7系列需要注意：
1、报Need a 1MB 'biosboot' type partition when install RHEL7 on a GPT disk with custom partition错
需要biosboot分区，加上：
part biosboot  --fstype=biosboot --size=1
2、%package %pre  %post 都要以 %end 结尾，不能省略，而且互相不能嵌套 。
3、part /boot 大小至少200。
4、不支持多个 %pre或者多个% post。但是，我的过程中，至少要一个%pre或者%post，不然会报Failed to start Switch Root错误。
5、配置脚本放在%post里面比较好，能完整执行。
6、systemctl start  service 不能用 报错，还没解决。用/etc/rc.d/rc.local，  必须先加chmod  u+x
7、key 要注释，我的系统不支持key这项。vim包默认没有，要自己加vim-enhanced

