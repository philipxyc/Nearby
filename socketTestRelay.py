from socketIO_client import SocketIO, LoggingNamespace
import time
socketIO=SocketIO('http://139.198.188.89:32884', verify=False)
socketIO.emit('reset')
def test():
    for i in range(5):
        socketIO.emit('Alvolus',i)
        time.sleep(3.5)

test()