import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
                style={styles.logo}
            />
            <Text style={styles.title}>Iniciar Sesión</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                keyboardType="email-address"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
            />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
                ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        padding: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#1e1e1e',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 20,
        elevation: 3,
    },
    button: {
        width: '100%',
        backgroundColor: '#007BFF',
        paddingVertical: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerText: {
        marginTop: 20,
        color: '#333',
    },
    link: {
        color: '#007BFF',
        fontWeight: '600',
    },
});
