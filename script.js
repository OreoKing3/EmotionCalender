class EmotionCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedEmotion = null;
        this.emotionData = this.loadEmotionData();
        this.emotionColors = {
            happy: '#FFD700',
            sad: '#4682B4',
            angry: '#DC143C',
            calm: '#98FB98',
            excited: '#FF69B4',
            anxious: '#DDA0DD',
            neutral: '#F5F5F5',
            clear: 'transparent'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCalendar();
        this.updateStats();
    }

    setupEventListeners() {
        // Month navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Emotion selection
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectEmotion(e.target.closest('.emotion-btn'));
            });
        });

        // Theme selector
        this.setupThemeSelector();
    }

    selectEmotion(button) {
        // Remove previous selection
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked button
        button.classList.add('selected');
        
        const emotion = button.dataset.emotion;
        const color = button.dataset.color;
        this.selectedEmotion = { emotion, color };

        // Add visual feedback
        button.style.transform = 'scale(1.05)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonthElement = document.getElementById('currentMonth');
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Clear calendar
        calendar.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendar.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if it's today
            const today = new Date();
            const isToday = day === today.getDate() && 
                this.currentDate.getMonth() === today.getMonth() && 
                this.currentDate.getFullYear() === today.getFullYear();
            
            if (isToday) {
                dayElement.classList.add('today');
            }

            // Check if this day has an emotion recorded
            const dateKey = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day));
            if (this.emotionData[dateKey]) {
                dayElement.classList.add('has-emotion');
                dayElement.style.backgroundColor = this.emotionData[dateKey].color;
                dayElement.style.borderColor = this.emotionData[dateKey].color;
                
                // Add emotion indicator
                const indicator = document.createElement('div');
                indicator.className = 'emotion-indicator';
                indicator.style.backgroundColor = this.emotionData[dateKey].color;
                dayElement.appendChild(indicator);
            }

            // Only allow clicking on today's date
            if (isToday) {
                dayElement.addEventListener('click', () => {
                    this.setEmotionForDay(day);
                });
                dayElement.style.cursor = 'pointer';
            } else {
                dayElement.classList.add('disabled');
                dayElement.style.cursor = 'not-allowed';
                dayElement.style.opacity = '0.6';
            }

            calendar.appendChild(dayElement);
        }

        this.updateStats();
    }

    setEmotionForDay(day) {
        if (!this.selectedEmotion) {
            this.showNotification('Please select an emotion first!', 'warning');
            return;
        }

        // Check if this is today's date
        const today = new Date();
        const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
        
        // Only allow recording emotions for today
        if (selectedDate.toDateString() !== today.toDateString()) {
            this.showNotification('You can only record emotions for today!', 'warning');
            return;
        }

        const dateKey = this.formatDate(selectedDate);
        
        if (this.selectedEmotion.emotion === 'clear') {
            delete this.emotionData[dateKey];
        } else {
            this.emotionData[dateKey] = {
                emotion: this.selectedEmotion.emotion,
                color: this.selectedEmotion.color
            };
        }

        this.saveEmotionData();
        this.renderCalendar();
        
        // Add animation
        const dayElement = event.target;
        dayElement.classList.add('emotion-selected');
        setTimeout(() => {
            dayElement.classList.remove('emotion-selected');
        }, 300);

        this.showNotification(`Emotion recorded for today!`, 'success');
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    updateStats() {
        const statsContainer = document.getElementById('emotionStats');
        statsContainer.innerHTML = '';

        const emotionCounts = {};
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        // Count emotions for current month
        Object.keys(this.emotionData).forEach(dateKey => {
            const date = new Date(dateKey);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                const emotion = this.emotionData[dateKey].emotion;
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            }
        });

        // Create stat items
        Object.keys(emotionCounts).forEach(emotion => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.style.borderLeftColor = this.emotionColors[emotion];

            statItem.innerHTML = `
                <span class="color-dot" style="background-color: ${this.emotionColors[emotion]};"></span>
                <div class="stat-info">
                    <div class="emotion-name">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
                    <div class="emotion-count">${emotionCounts[emotion]} day${emotionCounts[emotion] !== 1 ? 's' : ''}</div>
                </div>
            `;

            statsContainer.appendChild(statItem);
        });

        // Show message if no emotions recorded
        if (Object.keys(emotionCounts).length === 0) {
            statsContainer.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No emotions recorded for this month yet.</p>';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadEmotionData() {
        const saved = localStorage.getItem('emotionCalendarData');
        return saved ? JSON.parse(saved) : {};
    }

    saveEmotionData() {
        localStorage.setItem('emotionCalendarData', JSON.stringify(this.emotionData));
    }

    setupThemeSelector() {
        const themeBtn = document.getElementById('themeBtn');
        const themeDropdown = document.getElementById('themeDropdown');
        
        // Toggle dropdown
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            themeDropdown.classList.remove('show');
        });

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = option.dataset.theme;
                this.changeTheme(theme);
                themeDropdown.classList.remove('show');
            });
        });

        // Load saved theme
        this.loadTheme();
    }

    changeTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('theme-default', 'theme-forest', 'theme-ocean', 'theme-sunset', 'theme-night', 'theme-spring');
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Save theme preference
        localStorage.setItem('emotionCalendarTheme', theme);
        
        // Show notification
        this.showNotification(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}!`, 'success');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('emotionCalendarTheme') || 'default';
        this.changeTheme(savedTheme);
    }
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmotionCalendar();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        document.getElementById('prevMonth').click();
    } else if (e.key === 'ArrowRight') {
        document.getElementById('nextMonth').click();
    }
});