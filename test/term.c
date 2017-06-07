#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>

#define TTYDEV "/dev/ptmx"
int main(void)
{
	struct termios io;
	int iofd, i, n;
	char buf[16];

	// init serial
	bzero(&io, sizeof(struct termios));
	io.c_cflag |= CLOCAL | CREAD;
	io.c_cflag &= ~CSIZE;
	io.c_cflag |= CS8;
	io.c_cflag &= ~PARENB;
	io.c_cflag &= ~CSTOPB;
	cfsetispeed(&io, B9600);
	cfsetospeed(&io, B9600);

	iofd = open(TTYDEV, O_RDWR | O_NOCTTY);

	unlockpt(iofd);
	grantpt(iofd);

	if(iofd >= 0) {
		tcflush(iofd, TCIFLUSH);
		if(tcsetattr(iofd, TCSANOW, &io) != 0)
			return -2;
	}

	printf("open /dev/pts/5 in your other program\n");

	for(;;) {
		n = read(iofd, buf, 16);
		for (i = 0; i < n; i++) {
			if(buf[i] == 0x55) printf("\n");
			printf("0x%02x ", buf[i]);
			fflush(stdout);
		}
	}

	return iofd;
}
