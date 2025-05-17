import base64
from cryptography.fernet import Fernet

def convert_to_key(psk: str):
    repetitions = (32 // len(psk)) + 1
    modified_psk = (psk * repetitions)[:32]
    return base64.urlsafe_b64encode(modified_psk.encode())


def encrypt_message(message: str, key: str):
    key = convert_to_key(key)
    cipher_suite = Fernet(key)
    encrypted_message = cipher_suite.encrypt(message.encode())
    return encrypted_message.decode()


def decrypt_message(encrypted_message: str, key: str):
    key = convert_to_key(key)
    cipher_suite = Fernet(key)
    decrypted_message = cipher_suite.decrypt(encrypted_message.encode()).decode()
    return decrypted_message