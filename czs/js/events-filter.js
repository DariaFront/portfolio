document.addEventListener('DOMContentLoaded', function() {
    filterEvents();
    updateEventCountdowns();
    initToggleEvents();
    
    setInterval(updateEventCountdowns, 60 * 60 * 1000);
});

function parseEventDates(dateStr) {
    if (!dateStr) return { start: null, end: null };
    
    const parts = dateStr.split('/');
    const startDate = new Date(parts[0].trim());
    startDate.setHours(0, 0, 0, 0);
    
    let endDate;
    if (parts.length > 1) {
        endDate = new Date(parts[1].trim());
        endDate.setHours(0, 0, 0, 0);
    } else {
        endDate = new Date(startDate);
    }
    
    return { start: startDate, end: endDate };
}

function getEventStatus(startDate, endDate, today) {
    if (today < startDate) {
        return 'future';
    } else if (today >= startDate && today <= endDate) {
        return 'today';
    } else {
        return 'past';
    }
}

function filterEvents() {
    const eventLinks = document.querySelectorAll('.event-link-wrapper');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureEvents = [];
    const todayEvents = [];
    const pastEvents = [];
    
    eventLinks.forEach(link => {
        const dateStr = link.getAttribute('data-date');
        if (dateStr) {
            const { start, end } = parseEventDates(dateStr);
            const status = getEventStatus(start, end, today);
            
            const daysDiff = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
            
            const eventData = {
                element: link,
                date: start,
                daysDiff: daysDiff,
                status: status
            };
            
            link.classList.remove('past', 'today');
            
            if (status === 'past') {
                link.classList.add('past');
                pastEvents.push(eventData);
            } else if (status === 'today') {
                link.classList.add('today');
                todayEvents.push(eventData);
            } else {
                futureEvents.push(eventData);
            }
        }
    });
    
    futureEvents.sort((a, b) => a.daysDiff - b.daysDiff);
    todayEvents.sort((a, b) => a.daysDiff - b.daysDiff);
    pastEvents.sort((a, b) => b.daysDiff - a.daysDiff);
    
    const visibleEvents = [];
    
    const activeEvents = [...todayEvents, ...futureEvents];
    
    if (activeEvents.length >= 3) {
        visibleEvents.push(...activeEvents.slice(0, 3));
    } else {
        visibleEvents.push(...activeEvents);
        const remainingSlots = 3 - activeEvents.length;
        visibleEvents.push(...pastEvents.slice(0, remainingSlots));
    }
    
    eventLinks.forEach(link => {
        if (!visibleEvents.find(e => e.element === link)) {
            link.classList.add('none');
        } else {
            link.classList.remove('none');
        }
    });
}

function updateEventCountdowns() {
    const eventLinks = document.querySelectorAll('.event-link-wrapper');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    eventLinks.forEach(link => {
        const dateStr = link.getAttribute('data-date');
        if (dateStr) {
            const { start, end } = parseEventDates(dateStr);
            const status = getEventStatus(start, end, today);
            const daysLeftElement = link.querySelector('.days-left');
            
            link.classList.remove('past', 'today');
            
            if (!daysLeftElement) return;
            
            if (status === 'past') {
                link.classList.add('past');
                daysLeftElement.innerHTML = '<strong>Событие завершилось</strong>';
            } else if (status === 'today') {
                link.classList.add('today');
                daysLeftElement.innerHTML = '<strong>Сегодня</strong>';
            } else {
                const daysDiff = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
                daysLeftElement.innerHTML = `До события осталось: <strong>${daysDiff} ${getDaysWord(daysDiff)}</strong>`;
            }
        }
    });
}

function getDaysWord(number) {
    const lastTwoDigits = number % 100;
    const lastDigit = number % 10;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'дней';
    }
    
    if (lastDigit === 1) {
        return 'день';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня';
    } else {
        return 'дней';
    }
}

function initToggleEvents() {
    const toggleBtn = document.getElementById('toggleEventsBtn');
    if (!toggleBtn) return;
    
    let isExpanded = false;
    
    toggleBtn.addEventListener('click', function() {
        const eventLinks = document.querySelectorAll('.event-link-wrapper');
        
        if (isExpanded) {
            filterEvents();
            toggleBtn.textContent = 'ВСЕ МЕРОПРИЯТИЯ';
            isExpanded = false;
        } else {
            eventLinks.forEach(link => {
                link.classList.remove('none');
            });
            toggleBtn.textContent = 'СВЕРНУТЬ';
            isExpanded = true;
        }
    });
}