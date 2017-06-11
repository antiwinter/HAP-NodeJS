### no dns_sd.h
```
sudo apt-get install libavahi-compat-libdnssd-dev
```
or if CentOS
```
sudo yum install avahi avahi-compat-libdns_sd avahi-compat-libdns_sd-devel
```

### v8::String do not have member
install nodejs from nodesource as describes here:
https://github.com/nodesource/distributions

although I didn't successed on debian (carbon x1), finally modified /usr/include/nodejs/debs/v8.h manually.
https://github.com/nodejs/node-v0.x-archive/blob/v0.10.29/deps/v8/include/v8.h#L1075-L1084


### raspberry install
```
sudo apt-get update
sudo apt-get install samba vim git
sudo passwd pi
```

add samba configuration
```
cat >> /etc/samba/smb.conf
[pi]
   comment = pifs
   path = /home/pi
   valid users = @pi
   guest ok = no
   available = yes
   browseable = yes
   writable = yes
^Z

# enable 'wins support' in this file too

sudo smbpasswd -a pi
sudo /etc/init.d/smbd restart
```

install node js from node source
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs
```

get homehub and install
```
sudo apt-get install libavahi-compat-libdnssd-dev pigpio
git clone https://github.com/antiwinter/homehub
cd homehub
npm install
```

make homehub a service
```
npm install pm2 -g
su root
pm2 start /home/pi/homehub/start.js
pm2 startup
pm2 save
```


