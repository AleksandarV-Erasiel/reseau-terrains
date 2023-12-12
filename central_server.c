#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 3004
#define MAX_CONNECTIONS 5
#define BUFFER_SIZE 1024

void processBinaryData(const char* binaryData, size_t dataSize);

void processBinaryData(const char* binaryData, size_t dataSize) {
    if (dataSize >= 3) {
        unsigned char messageType = binaryData[0];
        unsigned char messageSize = binaryData[1];
        unsigned char dataValue = binaryData[2];

        printf("DOnnee recues: msgType=%u, msgSize=%u, dataValue=%u\n", messageType, messageSize, dataValue);
    }
}

int main() {
    int server_socket, new_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t addr_size = sizeof(struct sockaddr_in);
    char buffer[BUFFER_SIZE] = {0};

    if ((server_socket = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);


    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
        perror("Binding failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_socket, MAX_CONNECTIONS) == -1) {
        perror("Listening failed");
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port %d...\n", PORT);

    if ((new_socket = accept(server_socket, (struct sockaddr*)&client_addr, &addr_size)) == -1) {
        perror("Acceptance failed");
        exit(EXIT_FAILURE);
    }

    printf("Connection accepted from %s:%d\n", inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));
    close(server_socket);

    const char* welcome_message = "Salut je suis le serveur C !";
    send(new_socket, welcome_message, strlen(welcome_message), 0);

    while (1) {
        // Receive data from the client
        memset(buffer, 0, sizeof(buffer));
        ssize_t bytesRead = recv(new_socket, buffer, sizeof(buffer), 0);
        // if (recv(new_socket, buffer, sizeof(buffer), 0) <= 0) {
        //     perror("Connection closed");
        //     break;
        // }
        if (bytesRead <= 0) {
            perror("Connection closed");
            break;
        }

        processBinaryData(buffer, bytesRead);

        // send(new_socket, buffer, strlen(buffer), 0);
    }
    close(new_socket);

    return 0;
}
