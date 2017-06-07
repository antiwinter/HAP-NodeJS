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
