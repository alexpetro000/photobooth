sudo apt update
sudo apt upgrade

apt-get -y install imagemagick
apt-get -y install gphoto2

# sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

### WIFI ###
sudo apt-get -y install network-manager
sudo apt-get -y purge openresolv dhcpcd5

rfkill unblock 0
sudo usermod -aG netdev pi

echo "[Let adm group modify system settings for network]
Identity=unix-group:adm
Action=org.freedesktop.NetworkManager.*
ResultAny=yes
" | sudo tee /var/lib/polkit-1/localauthority/10-vendor.d/x.pkla

sudo service polkit restart
