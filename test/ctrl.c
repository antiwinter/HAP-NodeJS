#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>

#define TTYDEV "/dev/ttyUSB0"
int main(int argc, char *argv[])
{
	struct termios io;
	int iofd, i, j, n;
	unsigned char buf[16] = {0x55, 3};

	if(argc < 3) {
		printf("%s on/off relay1 relay2 relay3\n", argv[0]);
		return 1;
	}

	// init serial
	bzero(&io, sizeof(struct termios));
	io.c_cflag |= CLOCAL | CREAD;
	io.c_cflag &= ~CSIZE;
	io.c_cflag |= CS8;
	io.c_cflag &= ~PARENB;
	io.c_cflag &= ~CSTOPB;
	cfsetispeed(&io, B4800);
	cfsetospeed(&io, B4800);

	iofd = open(TTYDEV, O_RDWR | O_NOCTTY);

#if 0
	unlockpt(iofd);
	grantpt(iofd);
#endif

	if(iofd >= 0) {
		tcflush(iofd, TCIFLUSH);
		if(tcsetattr(iofd, TCSANOW, &io) != 0)
			return -2;
	}

	if(strcmp(argv[1], "on") == 0) {
		buf[2] = 0x12;
	} else if(strcmp(argv[1], "off") == 0) {
		buf[2] = 0x11;
	} else {
		printf("cmd %s is unknown\n");
		return 0;
	}
	for (i = 2; i < argc; i++) {
		buf[6] = atoi(argv[i]);
		for (j = 0, buf[7] = 0; j < 7; j++)
			buf[7] += buf[j];
		write(iofd, buf, 8);
		for (n = 0; n < 8; n++) printf("%02x ", buf[n]);
		printf("\n");
		usleep(100000);
	}

	return iofd;
}

