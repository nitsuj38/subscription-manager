const { createApp } = Vue;

createApp({
    template: `
        <div class="app">
            <!-- Header -->
            <header class="header">
                <div class="header-content">
                    <div class="logo">
                        <span class="logo-icon">💳</span>SubFlow
                    </div>
                    <div style="font-size: 0.9rem; color: var(--gray-500);">
                        Deine Abo-Verwaltung
                    </div>
                </div>
            </header>

            <!-- Main Container -->
            <div class="container">
                <!-- Tab Navigation -->
                <div class="tabs">
                    <button 
                        class="tab-btn" 
                        :class="{ active: activeTab === 'dashboard' }"
                        @click="activeTab = 'dashboard'"
                    >
                        📊 Dashboard
                    </button>
                    <button 
                        class="tab-btn" 
                        :class="{ active: activeTab === 'compare' }"
                        @click="activeTab = 'compare'"
                    >
                        ⚖️ Vergleiche
                    </button>
                </div>

                <!-- Dashboard Tab -->
                <div v-if="activeTab === 'dashboard'" class="dashboard-section">
                    <!-- Statistics -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Gesamtbudget</div>
                            <div class="stat-value">{{ totalCost.toFixed(2) }}€</div>
                            <div class="stat-info">pro Monat</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Aktive Abos</div>
                            <div class="stat-value">{{ subscriptions.length }}</div>
                            <div class="stat-info">insgesamt</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Bald auslaufend</div>
                            <div class="stat-value">{{ expiringCount }}</div>
                            <div class="stat-info">in 30 Tagen</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Jahresbudget</div>
                            <div class="stat-value">{{ (totalCost * 12).toFixed(0) }}€</div>
                            <div class="stat-info">geschätzt</div>
                        </div>
                    </div>

                    <!-- Alert Banner -->
                    <div v-if="expiringSubscriptions.length > 0" class="alert-banner">
                        <div class="alert-icon">⚠️</div>
                        <div class="alert-content">
                            <h3>Achtung: {{ expiringSubscriptions.length }} Abo läuft bald ab!</h3>
                            <div v-for="sub in expiringSubscriptions" :key="sub.id">
                                <p><strong>{{ sub.name }}</strong> endet am {{ formatDate(sub.expiryDate) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Subscriptions List -->
                    <h2 style="margin-top: 2rem; margin-bottom: 1rem; color: var(--gray-900); font-size: 1.2rem;">
                        Deine Abos
                    </h2>
                    
                    <div v-if="subscriptions.length === 0" class="empty-state">
                        <div class="empty-icon">🎯</div>
                        <h3>Keine Abos hinzugefügt</h3>
                        <p>Starte jetzt und füge deine erste Abonnement hinzu!</p>
                    </div>

                    <div v-else class="subscription-list">
                        <div 
                            v-for="sub in subscriptions" 
                            :key="sub.id"
                            class="subscription-card"
                            :class="{ 'expiring-soon': isExpiringSoon(sub.expiryDate) }"
                        >
                            <div v-if="isExpiringSoon(sub.expiryDate)" class="warning-badge">
                                ⚠️ Läuft bald ab
                            </div>

                            <div class="subscription-icon" :style="{ background: sub.color }">
                                {{ sub.icon }}
                            </div>

                            <div class="subscription-info">
                                <div class="subscription-name">{{ sub.name }}</div>
                                <div class="subscription-meta">
                                    <div class="meta-item">
                                        <span class="meta-label">Kategorie:</span> {{ sub.category }}
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">Endet:</span> {{ formatDate(sub.expiryDate) }}
                                    </div>
                                    <div v-if="sub.notes" class="meta-item">
                                        <span class="meta-label">Notiz:</span> {{ sub.notes }}
                                    </div>
                                </div>
                            </div>

                            <div class="subscription-price">
                                <div class="price-amount">{{ sub.cost }}€</div>
                                <div class="price-period">{{ sub.frequency }}</div>
                            </div>

                            <div class="subscription-actions">
                                <button class="action-btn" title="Bearbeiten" @click="editSubscription(sub)">
                                    ✏️
                                </button>
                                <button class="action-btn" title="Löschen" @click="deleteSubscription(sub.id)">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Compare Tab -->
                <div v-if="activeTab === 'compare'" class="compare-section">
                    <h2 style="margin-bottom: 1.5rem; color: var(--gray-900); font-size: 1.2rem;">
                        Vergleiche Anbieter
                    </h2>

                    <div class="category-selector">
                        <button 
                            v-for="cat in compareCategories" 
                            :key="cat"
                            class="category-btn"
                            :class="{ selected: selectedCategory === cat }"
                            @click="selectedCategory = cat"
                        >
                            {{ getCategoryEmoji(cat) }} {{ cat }}
                        </button>
                    </div>

                    <!-- Comparison Table -->
                    <div v-if="getComparisonData().length > 0" class="comparison-table">
                        <div class="table-header">
                            <div>Dienst</div>
                            <div>Preis/Monat</div>
                            <div>Features</div>
                            <div>Bewertung</div>
                        </div>
                        <div 
                            v-for="(item, index) in getComparisonData()" 
                            :key="index"
                            class="table-row"
                        >
                            <div class="table-cell service-name">{{ item.name }}</div>
                            <div class="table-cell price">{{ item.price }}€</div>
                            <div class="table-cell feature">{{ item.features }}</div>
                            <div class="table-cell">⭐ {{ item.rating }}/5</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Button -->
            <button class="add-subscription-btn" @click="addNewSubscription()" title="Neues Abo hinzufügen">
                ➕
            </button>
        </div>
    `,
    data() {
        return {
            activeTab: 'dashboard',
            selectedCategory: 'Streaming',
            compareCategories: ['Streaming', 'Mobilfunk', 'Fitness', 'Cloud Storage', 'Tools'],
            subscriptions: [
                {
                    id: 1,
                    name: 'Netflix',
                    category: 'Streaming',
                    cost: 12.99,
                    frequency: 'monatlich',
                    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    icon: '🎬',
                    color: '#e50914',
                    notes: 'Premium Plan'
                },
                {
                    id: 2,
                    name: 'Spotify',
                    category: 'Streaming',
                    cost: 11.99,
                    frequency: 'monatlich',
                    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                    icon: '🎵',
                    color: '#1DB954',
                    notes: 'Duo Plan'
                },
                {
                    id: 3,
                    name: 'Fitnessstudio XYZ',
                    category: 'Fitness',
                    cost: 49.99,
                    frequency: 'monatlich',
                    expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                    icon: '💪',
                    color: '#FF6B35',
                    notes: 'Premium Membership'
                },
                {
                    id: 4,
                    name: 'Adobe Creative Cloud',
                    category: 'Tools',
                    cost: 54.99,
                    frequency: 'monatlich',
                    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    icon: '🎨',
                    color: '#FF0000',
                    notes: 'All Apps'
                },
                {
                    id: 5,
                    name: 'OneDrive',
                    category: 'Cloud Storage',
                    cost: 2.99,
                    frequency: 'monatlich',
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    icon: '☁️',
                    color: '#0078D4',
                    notes: '100GB'
                },
                {
                    id: 6,
                    name: 'Vodafone Tarif',
                    category: 'Mobilfunk',
                    cost: 39.99,
                    frequency: 'monatlich',
                    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
                    icon: '📱',
                    color: '#E61C3C',
                    notes: '20GB Datenvolumen'
                }
            ],
            comparisonData: {
                'Streaming': [
                    { name: 'Netflix', price: 12.99, features: '4K, Offline', rating: 4.8 },
                    { name: 'Spotify', price: 11.99, features: 'Ad-free, Downloads', rating: 4.7 },
                    { name: 'Disney+', price: 10.99, features: '4K, Family', rating: 4.6 },
                    { name: 'Apple TV+', price: 9.99, features: 'Originals, 4K', rating: 4.4 }
                ],
                'Mobilfunk': [
                    { name: 'Vodafone', price: 39.99, features: '20GB, Unlimited Calls', rating: 4.1 },
                    { name: 'Telekom', price: 44.99, features: '25GB, Premium Support', rating: 4.3 },
                    { name: 'O2', price: 34.99, features: '15GB, National Roaming', rating: 3.9 },
                    { name: '1&1', price: 29.99, features: '10GB, Budget-friendly', rating: 3.7 }
                ],
                'Fitness': [
                    { name: 'FitX', price: 14.99, features: 'Cardio, Gewichte', rating: 4.2 },
                    { name: 'McFit', price: 19.99, features: 'Premium, 24/7', rating: 4.0 },
                    { name: 'Fitnessstudio XYZ', price: 49.99, features: 'Personal Trainer', rating: 4.5 },
                    { name: 'Peloton', price: 39.99, features: 'Online, App', rating: 4.6 }
                ],
                'Cloud Storage': [
                    { name: 'Google Drive', price: 1.99, features: '100GB, Sync', rating: 4.7 },
                    { name: 'OneDrive', price: 2.99, features: '100GB, Office', rating: 4.5 },
                    { name: 'Dropbox', price: 11.99, features: '2TB, Sharing', rating: 4.4 },
                    { name: 'iCloud+', price: 3.99, features: '200GB, Apple', rating: 4.3 }
                ],
                'Tools': [
                    { name: 'Adobe CC', price: 54.99, features: 'Alle Apps, Cloud', rating: 4.7 },
                    { name: 'Microsoft 365', price: 7.99, features: 'Office, OneDrive', rating: 4.5 },
                    { name: 'Canva Pro', price: 14.99, features: 'Design, Templates', rating: 4.6 },
                    { name: 'Notion', price: 12.00, features: 'Workspace, AI', rating: 4.4 }
                ]
            }
        };
    },
    computed: {
        totalCost() {
            return this.subscriptions.reduce((sum, sub) => {
                if (sub.frequency === 'monatlich') {
                    return sum + sub.cost;
                } else if (sub.frequency === 'jährlich') {
                    return sum + (sub.cost / 12);
                }
                return sum;
            }, 0);
        },
        expiringCount() {
            const soon = new Date();
            soon.setDate(soon.getDate() + 30);
            return this.subscriptions.filter(sub => sub.expiryDate <= soon).length;
        },
        expiringSubscriptions() {
            const soon = new Date();
            soon.setDate(soon.getDate() + 30);
            return this.subscriptions.filter(sub => sub.expiryDate <= soon);
        }
    },
    methods: {
        formatDate(date) {
            return date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        isExpiringSoon(expiryDate) {
            const soon = new Date();
            soon.setDate(soon.getDate() + 30);
            return expiryDate <= soon;
        },
        addNewSubscription() {
            const newSub = {
                id: Math.max(...this.subscriptions.map(s => s.id), 0) + 1,
                name: prompt('Dienst-Name:') || 'Neues Abo',
                category: 'Tools',
                cost: parseFloat(prompt('Monatliche Kosten (€):') || '0'),
                frequency: 'monatlich',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                icon: '📦',
                color: '#6366f1',
                notes: ''
            };
            this.subscriptions.push(newSub);
        },
        editSubscription(sub) {
            const newCost = parseFloat(prompt('Neuer Preis:', sub.cost) || sub.cost);
            sub.cost = newCost;
            alert('Abo aktualisiert!');
        },
        deleteSubscription(id) {
            if (confirm('Möchtest du dieses Abo wirklich löschen?')) {
                this.subscriptions = this.subscriptions.filter(s => s.id !== id);
            }
        },
        getComparisonData() {
            return this.comparisonData[this.selectedCategory] || [];
        },
        getCategoryEmoji(category) {
            const emojis = {
                'Streaming': '🎬',
                'Mobilfunk': '📱',
                'Fitness': '💪',
                'Cloud Storage': '☁️',
                'Tools': '🎨'
            };
            return emojis[category] || '📦';
        }
    },
    mounted() {
        console.log('SubFlow Abo-Manager geladen! 🚀');
    }
}).mount('#app');