//https://github.com/hazed0m/digital-suits-cinema-tickets.git

// Реализовать одностраничное приложение резервирования билетов в кинотеатр.
// Время начала сеансов 10.00, время последнего сеанса 20.00. Шаг каждые - 2 часа.
// Таким образом в течение дня может быть 6 сеансов.
// Интерфейс должен отображать доступные даты для бронирования,
// сеансы для выбранной даты, свободные и забронированные места.
// Максимальное число мест 4 - 5. Все данные о билетах можно хранить либо в JSON, либо сделать статикой.
// Для хранения дат использовать LocalStorage, и при перезагрузке страницы считывать данные из LocalStorage.
// Максимальный период бронирования: одна неделя от текущей даты.
// Проверить совместимость с современными браузерами (Safari, Google Chrome, FireFox, Edge)
// Реализовать на JavaScript/JQuery/HTML5/CSS3
const selectors = {
    'sessionWrapper': ".movies__session",
    'seatsWrapper': '.session__seats-wrapper',
    'seatItem': '.session__seat',
    'timeWrapper': '.movies__time-wrapper',
    'moviesWrapper': '.movies__wrapper',
    'moviesItemWrapper': '.movies__item-wrapper',
    'moviesItem': '.movies__item',
    'localStorage': 'monthSession',
    'register': '.register',
    'registerWrapper': '.register__wrapper',
    'registerForm': '.register__form',
    'container': '.container',
    'tickets': '.tickets',
    'ticketsWrapper': '.tickets__wrapper',
    'ticketsTitle': '.tickets__title'
};
const schemas = {
    daySessionSchema: {
        'A': {},
        'B': {}
    },
    seatList: {
        top: false, left: false, bottom: false, right: false
    },
    monthsList: [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};
const modifiers = {
    active: 'active',
    gone: 'gone',
    done: 'done'
}
const data = {
    sessionsChart: [
        {
            movieTitle: "John Wick 4",
            movieCover: "johnwick4.jpeg",
            movieGenre: "Action",
            movieId: 120,
            hallName: 'A',
            playingHours: {
                10: schemas.seatList, 12: schemas.seatList, 14: schemas.seatList, 16: schemas.seatList, 18: schemas.seatList, 20: schemas.seatList
            }
        },
        {
            movieTitle: "The Pope's Exorcist",
            movieCover: "thepopesexsorcist.jpeg",
            movieGenre: "Thriller",
            movieId: 122,
            hallName: 'B',
            playingHours: {
                18: schemas.seatList, 20: schemas.seatList
            }
        },
        {
            movieTitle: "Super Mario Movie",
            movieCover: "mariobrosmovie.jpeg",
            movieGenre: "Animation",
            movieId: 135,
            hallName: 'B',
            playingHours: {
                10: schemas.seatList, 12: schemas.seatList, 14: schemas.seatList, 16: schemas.seatList
            }
        }
    ],
    monthSession: null,
    bookedSeat: null,
    userName: 'Anonymous',
    tickets: []
}

const globalDate = new Date();

function generateMonthSession() {
    const weekDayCount = 7; //  7 days from current date by task or can use lastDate variable to make month schedule
    const currentDate = globalDate.getDate();
    const currentMonth = globalDate.getMonth();
    const currentMonthName = schemas.monthsList[currentMonth];
    const lastDate = new Date(globalDate.getFullYear(), globalDate.getMonth() + 1, 0).getDate();
    const availableSessionsList = {};
    const daySessionSchema = generateDaySession();

    //Generate Month using weekDayCount
    if(currentDate + weekDayCount <= lastDate) {
        availableSessionsList[currentMonthName] = {};

        for (let i = 0; i <= weekDayCount; i++) {
            availableSessionsList[currentMonthName][`${currentDate + i}`] = daySessionSchema;
        }
    }
    return availableSessionsList;
}
function generateDaySession() {
    data.sessionsChart.forEach(function(item, index) {
        schemas.daySessionSchema[item.hallName][`${item.movieId}`] = item;
    });
    return schemas.daySessionSchema;
}
function generateSeats(time, seats, movieId, hallName, iterator) {
    let seatTemplate = ``;
    let timeWrapper = ``;
    //Render time-wrapper
    timeWrapper += `<div data-time="${time}" class="movies__time${iterator == 0 ? ' active' : ''}">${time}:00</div>`;
    //Start session__seats-wrapper
    seatTemplate += `<div data-time="${time}" class="session__seats-wrapper${iterator == 0 ? ' active' : ''} border-shadow">`;
    //Seats till next hour
    for (const [title, seat] of Object.entries(seats)) {
        seatTemplate += `<div seat-status="${seat}" hall-name="${hallName}" movie-id="${movieId}" seat-position="${title}" seat-position="${title}" class="session__seat${seat != false ? ` ${modifiers.gone}` : ''}">
                <div class="session__seat-icon"></div>
            </div>
        `;
    }
    //End session__seats-wrapper
    seatTemplate += `<div class="session__seat-time">${time}:00</div>`;
    seatTemplate += `</div>`;
    return {
        timeWrapper: timeWrapper,
        seatTemplate: seatTemplate
    };
}
function generatePlayingHours(hoursList, movieId, hallName, sessionDay) {
    let commonTemplate = ``;
    let seatTemplate = ``;
    let timeWrapper = ``;
    let hoursTemplate = ``;
    let iterator = 0;

    const currentDate = globalDate.getDate();
    const currentHour = globalDate.getHours();

    for (const [time, seats] of Object.entries(hoursList)) {
        //check to remove finished or started sessions
        if(currentDate == sessionDay) {
            if(currentHour <= time) {
                commonTemplate = generateSeats(time, seats, movieId, hallName, iterator);
            } else {
                continue;
            }
        } else {
            commonTemplate = generateSeats(time, seats, movieId, hallName, iterator);
        }
        timeWrapper += commonTemplate.timeWrapper;
        seatTemplate += commonTemplate.seatTemplate;
        iterator++;
    }
    hoursTemplate = `
            <div class="movies__time-wrapper">
                ${timeWrapper}
            </div>
            <div class="movies__session">
                ${seatTemplate}
            </div>
        `;
    if(timeWrapper === '' || seatTemplate === '') {
        hoursTemplate = '';
    }
    return hoursTemplate;
}
function generateMovieItem(sessions, sessionDate) {
    if(sessions != undefined) {
        let movieTemplate = ``;
        for (const hall in sessions) {
            const hallMoviesList = sessions[hall];
            const hallWrapper = `<div class="movies__hall">Hall "${hall}"</div>`;
            movieTemplate += hallWrapper;
            for (const movieItemKey in hallMoviesList) {
                const movieItem = hallMoviesList[movieItemKey];
                const playingTimeTemplate = generatePlayingHours(movieItem.playingHours, movieItem.movieId, hall, parseInt(sessionDate));
                if(playingTimeTemplate != '') {
                    movieTemplate += `
                        <div class="movies__item border-shadow">
                            <div class="movies__image-wrapper border-shadow" style="background-image: url(/assets/images/${movieItem.movieCover})"></div>
                            <div class="movies__title-wrapper">
                                <div class="movies__title">${movieItem.movieTitle}</div>
                                <div class="movies__genre">${movieItem.movieGenre}</div>
                            </div>
                            ${playingTimeTemplate}
                        </div>
                    `;
                }
            };
        }
        return movieTemplate;
    }
}
function LettersAndSpaces(str) {
    return Boolean(str?.match(/^[A-Za-z\s]*$/));
}
function setLocalStorage(localStorageData) {
    if(localStorageData != undefined) {
        localStorage.setItem(selectors.localStorage, JSON.stringify(localStorageData));
    } else {
        if(localStorage.getItem(selectors.localStorage) === null) {
            localStorage.setItem(selectors.localStorage, JSON.stringify(data.monthSession));
        }
    }
}
function getLocalStorage() {
    const localStorageObject = JSON.parse(localStorage.getItem(selectors.localStorage));
    return localStorageObject;
}
function eventsLoader() {
    const timeWrapper = $(selectors.timeWrapper);
    const seatsWrapper = $(selectors.seatsWrapper);
    const register = $(selectors.register);
    const container = $(selectors.container);
    const registerForm = $(selectors.registerForm);
    const tickets = $(selectors.tickets);
    const ticketsTitle = $(selectors.ticketsTitle);
    const ticketsWrapper = $(selectors.ticketsWrapper);

    timeWrapper.on('click', function(e) {
        const clickTarget = $(e.target);

        const currentTime = clickTarget.attr('data-time');
        const moviesItemWrapper = clickTarget.closest(selectors.moviesItemWrapper);
        const moviesItem = clickTarget.closest(selectors.moviesItem);
        const date = moviesItemWrapper.attr('data-date');
        const month = moviesItemWrapper.attr('data-month');
        const activeSessionWrapper = moviesItem.find(`${selectors.timeWrapper} .${modifiers.active}`);
        const activeSeatsWrapper = moviesItem.find(`${selectors.seatsWrapper}.${modifiers.active}`);

        if(currentTime !== undefined) {
            const currentSeatWrapper = moviesItem.find(`${selectors.seatsWrapper}[data-time="${currentTime}"]`);
            activeSessionWrapper.removeClass(modifiers.active);
            activeSeatsWrapper.removeClass(modifiers.active);
            clickTarget.addClass(modifiers.active);
            currentSeatWrapper.addClass(modifiers.active);
        }
    });
    seatsWrapper.on('click', function(e) {
        const clickTarget = $(e.target).closest(selectors.seatItem);
        if(!clickTarget.hasClass(modifiers.gone)) {
            const moviesItemWrapper = clickTarget.closest(selectors.moviesItemWrapper);
            const seatsWrapper = clickTarget.closest(selectors.seatsWrapper);
            const time = seatsWrapper.attr('data-time');
            const date = moviesItemWrapper.attr('data-date');
            const month = moviesItemWrapper.attr('data-month');
            const currentSeat = clickTarget.attr('seat-position');
            const hallName = clickTarget.attr('hall-name');
            const movieId = clickTarget.attr('movie-id');
            const localStorageData = getLocalStorage();
            const movieTitle = localStorageData[month][date][hallName][movieId].movieTitle;

            if(localStorageData !== undefined) {
                localStorageData[month][date][hallName][movieId].playingHours[time][currentSeat] = true;
                setLocalStorage(localStorageData);
                clickTarget.addClass(modifiers.gone);

                if(data.userName != '') {
                    data.tickets.push({
                        name: data.userName,
                        time: time,
                        date: date,
                        month: month,
                        movieId: movieId,
                        movieTitle: movieTitle,
                        currentSeat: currentSeat
                    });
                }
                localStorage.setItem('tickets', JSON.stringify(data.tickets));
                renderTickets();
            }
        }
    });
    registerForm.on('submit', function(e) {
        e.preventDefault();
        const register = $(selectors.register);
        const container = $(selectors.container);
        const registerInput = registerForm.find('#name');
        const name = registerInput.val();
        if(LettersAndSpaces(name) === true && name != '') {
            localStorage.setItem('name', name);
            data.userName = name;
            container.addClass(modifiers.active);
            register.addClass(modifiers.done);
            registerInput.val('');
        } else {
            registerInput.val('');
            registerInput.css({
                'border-color': '#d82727'
            });
            registerInput.attr('placeholder', 'Only letters and spaces');
        }
    });
    ticketsTitle.on('click', toggleTicketsWrapper);
    ticketsWrapper.on('click', toggleTicketsWrapper);
    ticketsWrapper.on('mouseleave', hideTicketsWrapper);
    container.on('mouseover', hideTicketsWrapper);
}
function toggleTicketsWrapper() {
    const ticketsWrapper = $(selectors.ticketsWrapper);
    if (!ticketsWrapper.hasClass(modifiers.active)) {
        ticketsWrapper.addClass(modifiers.active);
    } else {
        ticketsWrapper.removeClass(modifiers.active);
    }
}
function hideTicketsWrapper() {
    const ticketsWrapper = $(selectors.ticketsWrapper);
    ticketsWrapper.removeClass(modifiers.active);
}
function getTickets() {
    const ticketsLocalStorage = localStorage.getItem('tickets');
    if(ticketsLocalStorage != undefined) {
        const tickets = JSON.parse(ticketsLocalStorage);
        data.tickets = tickets;
        renderTickets();
    }
}
function renderTickets() {
    const ticketsWrapper = $(selectors.ticketsWrapper);
    const tickets = $(selectors.tickets);

    let ticketTemplate = ``;
    tickets.addClass(modifiers.active);
    ticketsWrapper.empty();
    $(data.tickets).each(function(index, item) {
        ticketTemplate += `
            <div class="tickets__ticket-item">
               <span class="tickets__ticket-info">Movie - ${item.movieTitle}</span>       
               <span class="tickets__ticket-info">Seat - ${item.currentSeat}</span>  
               <span class="tickets__ticket-info">Time - ${item.time}:00</span>
               <span class="tickets__ticket-info">Date - ${item.date} ${item.month}</span>
               <span class="tickets__ticket-info">Visitor - ${item.name}</span>                 
            </div>
        `;
    });
    ticketsWrapper.append(ticketTemplate);
}
function getName() {
    const register = $(selectors.register);
    const container = $(selectors.container);
    const nameLocalStorage = localStorage.getItem('name');

    if(nameLocalStorage != undefined) {
        data.userName = nameLocalStorage;
        register.addClass(modifiers.done);
        container.addClass(modifiers.active);
    }
}
function render() {
    const moviesContainer = $(selectors.moviesWrapper);
    const localStorageData = getLocalStorage();
    const currentDate = globalDate.getDate();
    const currentHour = globalDate.getHours();
    let currentData = null;
    let months = null;

    if(localStorageData != undefined) {
        currentData = localStorageData;
        months = Object.keys(localStorageData)
    } else {
        data.monthSession = generateMonthSession();
        currentData = data.monthSession;
        months = Object.keys(data.monthSession);
    }

    if(months != null && currentData != null) {
        //Clean container
        moviesContainer.empty();

        //Render each month
        $(months).each(function (index, month) {
            for (const sessionDate in currentData[month]) {
                const session = currentData[month][sessionDate];
                const dayWrapper = `<div class="movies__day-wrapper">
                                        <div class="movies__day-title border-bottom">${sessionDate} ${month}</div>
                                    </div>`;
                const generateMovieTemplate = generateMovieItem(session, sessionDate);
                if (generateMovieTemplate != '') {
                    const template = `<div class="movies__item-wrapper" data-date="${sessionDate}" data-month="${month}">
                                        ${dayWrapper}
                                        ${generateMovieTemplate}
                                    </div>`;
                    if(currentDate == sessionDate) {
                        if(currentHour <= 20) {
                            moviesContainer.append(template);
                        }
                    } else if(currentDate < sessionDate) {
                        moviesContainer.append(template);
                    }
                }
            }
        });
    }
    getName();
    getTickets();
    setLocalStorage();
    eventsLoader();
}

render();