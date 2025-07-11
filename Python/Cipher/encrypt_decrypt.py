import string

def caesar_cipher(text, shift, mode='encrypt'):
    alphabet = string.ascii_lowercase
    shifted_alphabet = alphabet[shift:] + alphabet[:shift]
    table = str.maketrans(alphabet, shifted_alphabet)

    if mode == 'decrypt':
        table = str.maketrans(shifted_alphabet, alphabet)

    return text.translate(table)

def main():
    while True:
        mode = input("Would you like to encrypt or decrypt? (e/d): ").lower()
        if mode not in ['e', 'd']:
            print("Invalid mode. Please enter 'e' for encrypt or 'd' for decrypt.")
            continue

        text = input("Enter the text: ").lower()
        shift = int(input("Enter the shift value (0-25): "))

        if mode == 'e':
            result = caesar_cipher(text, shift, 'encrypt')
            print(f"Encrypted text: {result}")
        else:
            result = caesar_cipher(text, shift, 'decrypt')
            print(f"Decrypted text: {result}")

        again = input("Would you like to encrypt/decrypt another message? (y/n): ").lower()
        if again != 'y':
            break

    print("Thank you for using the encryption/decryption tool!")

if __name__ == "__main__":
    main()
