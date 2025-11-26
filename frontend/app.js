// API Base URL
const API_URL = 'http://localhost:5024/api';

async function createUser() {
    const name = document.getElementById('userName').value;
    const password = document.getElementById('userPassword').value;
    
    if (!name || !password) {
        alert('Bitte fülle alle Felder aus!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                password: password
            })
        });
        
        if (response.ok) {
            alert('Benutzer erstellt!');
            document.getElementById('userName').value = '';
            document.getElementById('userPassword').value = '';
            loadUsers();
        } else {
            alert('Fehler beim Erstellen');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Verbindungsfehler. Stelle sicher, dass das Backend läuft!');
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'item';
            userDiv.innerHTML = `
                <strong>${user.name}</strong>
                <br>ID: ${user.id}
            `;
            usersList.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Fehler beim Laden der Benutzer');
    }
}

// Beim Laden der Seite automatisch User anzeigen
window.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
