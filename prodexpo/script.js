/**
 * Модуль для работы с хранилищем данных о продуктах
 */
const ProductStorage = {
    STORAGE_KEY: 'productCatalog',
    MAX_PRODUCTS_PER_COMPANY: 6,
    EVENT_ID: 51, // eventId всегда 51 для компании
    
    /**
     * Инициализирует хранилище
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    },
    
    /**
     * Получает все компании из хранилища
     * @returns {Array} Массив компаний
     */
    getAllCompanies() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return JSON.parse(data) || [];
    },
    
    /**
     * Сохраняет все компании в хранилище
     * @param {Array} companies - Массив компаний
     */
    saveAllCompanies(companies) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(companies));
    },
    
    /**
     * Находит компанию по названию
     * @param {string} companyName - Название компании
     * @returns {Object|null} Объект компании или null
     */
    findCompanyByName(companyName) {
        if (!companyName || !companyName.trim()) return null;
        
        const companies = this.getAllCompanies();
        return companies.find(company => 
            company.name.toLowerCase() === companyName.trim().toLowerCase()
        ) || null;
    },
    
    /**
     * Находит индекс компании по названию
     * @param {string} companyName - Название компании
     * @returns {number} Индекс компании или -1
     */
    findCompanyIndexByName(companyName) {
        if (!companyName || !companyName.trim()) return -1;
        
        const companies = this.getAllCompanies();
        return companies.findIndex(company => 
            company.name.toLowerCase() === companyName.trim().toLowerCase()
        );
    },
    
    /**
     * Создает новую компанию с eventId = 51
     * @param {string} companyName - Название компании
     * @returns {Object} Объект новой компании
     */
    createCompany(companyName) {
        const now = new Date().toISOString();
        return {
            name: companyName.trim(),
            eventId: this.EVENT_ID, // Всегда 51 для компании
            products: [], // Продукты БЕЗ eventId
            createdAt: now,
            editedAt: now
        };
    },
    
    /**
     * Сохраняет все продукты компании
     * @param {string} companyName - Название компании
     * @param {Array} products - Массив продуктов (БЕЗ eventId)
     * @returns {Object} Обновленный объект компании
     */
    saveCompanyProducts(companyName, products) {
        const companies = this.getAllCompanies();
        const companyIndex = this.findCompanyIndexByName(companyName);
        let company;
        
        if (companyIndex === -1) {
            // Создаем новую компанию
            company = this.createCompany(companyName);
            companies.push(company);
        } else {
            company = companies[companyIndex];
            company.editedAt = new Date().toISOString();
        }
        
        // Сохраняем продукты (БЕЗ добавления eventId в продукты)
        company.products = products;
        
        // Сохраняем изменения
        this.saveAllCompanies(companies);
        
        return company;
    }
};

/**
 * Модуль для управления формами продуктов
 */
const ProductFormsManager = {
    formsContainer: null,
    addProductButton: null,
    currentFormsCount: 1,
    MAX_FORMS: 6,
    formsData: {}, // Хранит временные данные форм по индексам
    
    /**
     * Инициализирует менеджер форм
     */
    init() {
        this.formsContainer = document.getElementById('productFormsContainer');
        this.addProductButton = document.getElementById('addProductButton');
        this.bindEvents();
        this.updateAddButton();
    },
    
    /**
     * Привязывает обработчики событий
     */
    bindEvents() {
        // Кнопка добавления новой формы
        this.addProductButton.addEventListener('click', () => this.addNewForm());
        
        // Обработчики для загрузки фото (делегирование)
        this.formsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.photo-upload')) {
                const uploadDiv = e.target.closest('.photo-upload');
                const index = uploadDiv.id.replace('photoUpload', '');
                document.getElementById(`photo${index}`).click();
            }
        });
        
        this.formsContainer.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                const index = e.target.id.replace('photo', '');
                this.handlePhotoUpload(e, index);
            }
        });
        
        // Удаление форм
        this.formsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-product')) {
                const button = e.target.closest('.btn-remove-product');
                const index = parseInt(button.dataset.productIndex);
                this.removeForm(index);
            }
        });
    },
    
    /**
     * Создает новую форму продукта
     * @param {number} index - Индекс формы
     * @returns {HTMLElement} Элемент формы
     */
    createForm(index) {
        const formHtml = `
            <div class="product-form-section" data-product-index="${index}">
                <h2 class="product-title">
                    <i class="fas fa-box"></i> Продукт ${index}
                    <button type="button" class="btn-remove-product" data-product-index="${index}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </h2>
                <div class="form-row">
                    <div class="form-group">
                        <label for="manufacturer${index}" class="required">Производитель</label>
                        <input type="text" id="manufacturer${index}" name="manufacturer${index}"
                            placeholder="Введите название производителя">
                        <div class="error-message" id="manufacturer${index}-error">Поле "Производитель" обязательно для заполнения
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="country${index}" class="required">Страна</label>
                        <input type="text" id="country${index}" name="country${index}" placeholder="Страна производства">
                        <div class="error-message" id="country${index}-error">Поле "Страна" обязательно для заполнения</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="city${index}" class="required">Город</label>
                        <input type="text" id="city${index}" name="city${index}" placeholder="Город производства">
                        <div class="error-message" id="city${index}-error">Поле "Город" обязательно для заполнения</div>
                    </div>
                    <div class="form-group">
                        <label for="brand${index}" class="required">Бренд</label>
                        <input type="text" id="brand${index}" name="brand${index}" placeholder="Торговая марка продукта">
                        <div class="error-message" id="brand${index}-error">Поле "Бренд" обязательно для заполнения</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="category${index}" class="required">Категория продукта</label>
                        <input type="text" id="category${index}" name="category${index}" placeholder="Введите категорию">
                        <div class="error-message" id="category${index}-error">Пожалуйста, выберите категорию продукта</div>
                    </div>
                    <div class="form-group">
                        <label for="productName${index}" class="required">Название продукта полностью</label>
                        <input type="text" id="productName${index}" name="productName${index}" placeholder="Полное наименование продукта">
                        <div class="error-message" id="productName${index}-error">Поле "Название продукта" обязательно для
                            заполнения</div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="description${index}" class="required">Описание продукта</label>
                    <textarea id="description${index}" name="description${index}"
                        placeholder="Подробное описание продукта, его характеристик и особенностей"></textarea>
                    <div class="error-message" id="description${index}-error">Поле "Описание продукта" обязательно для
                        заполнения</div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="price${index}" class="required">Цена на полке за 1 шт (руб.)</label>
                        <input type="number" id="price${index}" name="price${index}" min="0" step="0.01" placeholder="0.00">
                        <div class="error-message" id="price${index}-error">Пожалуйста, введите корректную цену</div>
                    </div>
                    <div class="form-group">
                        <label for="packaging${index}" class="required">Фасовка, упаковка</label>
                        <input type="text" id="packaging${index}" name="packaging${index}"
                            placeholder="Например: пластиковая бутылка, картонная коробка">
                        <div class="error-message" id="packaging${index}-error">Поле "Фасовка, упаковка" обязательно для заполнения
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="weight${index}" class="required">Вес/Объем</label>
                        <input type="text" id="weight${index}" name="weight${index}" placeholder="Например: 500 г, 1 л, 250 мл">
                        <div class="error-message" id="weight${index}-error">Поле "Вес/Объем" обязательно для заполнения</div>
                    </div>
                    <div class="form-group">
                        <label for="website${index}">Сайт</label>
                        <input type="text" id="website${index}" name="website${index}" placeholder="https://example.com">
                        <div class="error-message" id="website${index}-error">Введите корректный URL сайта</div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="composition${index}" class="required">Состав</label>
                    <textarea id="composition${index}" name="composition${index}"
                        placeholder="Ингредиенты или компоненты продукта"></textarea>
                    <div class="error-message" id="composition${index}-error">Поле "Состав" обязательно для заполвания</div>
                </div>
                <div class="form-group">
                    <label for="photo${index}">Фото продукта</label>
                    <div class="photo-upload" id="photoUpload${index}">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Нажмите для загрузки фотографии продукта (опционально)</p>
                        <p><small>Поддерживаемые форматы: JPG, PNG, GIF (макс. размер: 5MB)</small></p>
                        <input type="file" id="photo${index}" name="photo${index}" accept="image/*" style="display: none;">
                    </div>
                    <div class="photo-preview" id="photoPreview${index}">
                        <img src="" alt="Предпросмотр фото продукта" id="previewImage${index}">
                    </div>
                    <div class="error-message" id="photo${index}-error">Максимальный размер файла: 5MB</div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formHtml;
        return tempDiv.firstElementChild;
    },
    
    /**
     * Добавляет новую форму продукта
     */
    addNewForm() {
        if (this.currentFormsCount >= this.MAX_FORMS) {
            alert(`Максимальное количество продуктов: ${this.MAX_FORMS}`);
            return;
        }
        
        this.currentFormsCount++;
        const newForm = this.createForm(this.currentFormsCount);
        this.formsContainer.appendChild(newForm);
        this.updateAddButton();
        
        // Прокрутка к новой форме
        newForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    
    /**
     * Удаляет форму продукта
     * @param {number} index - Индекс формы
     */
    removeForm(index) {
        const form = document.querySelector(`[data-product-index="${index}"]`);
        if (form) {
            if (index === 1) {
                alert('Нельзя удалить первую форму продукта');
                return;
            }
            
            if (confirm(`Удалить продукт ${index}?`)) {
                form.remove();
                this.currentFormsCount--;
                this.updateAddButton();
                
                // Удаляем данные формы
                if (this.formsData[index]) {
                    delete this.formsData[index];
                }
            }
        }
    },
    
    /**
     * Обновляет индексы всех форм после удаления
     */
    updateFormsIndexes() {
        const forms = this.formsContainer.querySelectorAll('.product-form-section');
        forms.forEach((form, index) => {
            const newIndex = index + 1;
            form.dataset.productIndex = newIndex;
            
            // Обновляем заголовок
            const title = form.querySelector('h2');
            const icon = title.querySelector('i');
            title.innerHTML = `<i class="${icon.className}"></i> Продукт ${newIndex} 
                <button type="button" class="btn-remove-product" data-product-index="${newIndex}">
                    <i class="fas fa-trash"></i> Удалить
                </button>`;
            
            // Обновляем все id и name атрибуты
            this.updateFormElementsIds(form, index + 1, newIndex);
        });
        
        // Обновляем currentFormsCount
        this.currentFormsCount = forms.length;
    },
    
    /**
     * Обновляет id и name элементов формы
     */
    updateFormElementsIds(form, oldIndex, newIndex) {
        const elements = form.querySelectorAll('[id]');
        elements.forEach(element => {
            if (element.id && element.id.includes(oldIndex)) {
                const newId = element.id.replace(oldIndex, newIndex);
                element.id = newId;
                
                // Обновляем name
                if (element.name) {
                    element.name = element.name.replace(oldIndex, newIndex);
                }
                
                // Обновляем связанные label и error message
                const label = form.querySelector(`label[for="${element.id}"]`);
                if (label) {
                    label.htmlFor = newId;
                }
                
                const error = form.querySelector(`.error-message[id$="-error"]`);
                if (error && error.id.includes(oldIndex)) {
                    error.id = error.id.replace(oldIndex, newIndex);
                }
            }
        });
    },
    
    /**
     * Обновляет состояние кнопки добавления
     */
    updateAddButton() {
        if (this.currentFormsCount >= this.MAX_FORMS) {
            this.addProductButton.disabled = true;
            this.addProductButton.innerHTML = '<i class="fas fa-ban"></i> Максимальное количество продуктов';
        } else {
            this.addProductButton.disabled = false;
            this.addProductButton.innerHTML = `<i class="fas fa-plus-circle"></i> Добавить продукт (${this.currentFormsCount}/${this.MAX_FORMS})`;
        }
    },
    
    /**
     * Обрабатывает загрузку фото (опционально)
     */
    handlePhotoUpload(event, index) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Проверка размера (если файл загружен)
        if (file.size > 5 * 1024 * 1024) {
            this.showError(`photo${index}-error`, 'Файл слишком большой. Максимальный размер: 5MB');
            return;
        }
        
        // Проверка типа (если файл загружен)
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            this.showError(`photo${index}-error`, 'Неподдерживаемый формат файла. Используйте JPG, PNG или GIF');
            return;
        }
        
        // Превью
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById(`previewImage${index}`);
            const photoPreview = document.getElementById(`photoPreview${index}`);
            
            if (previewImage && photoPreview) {
                previewImage.src = e.target.result;
                photoPreview.style.display = 'block';
                this.hideError(`photo${index}-error`);
                
                // Сохраняем данные фото во временном хранилище
                this.formsData[index] = this.formsData[index] || {};
                this.formsData[index].photo = {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    dataUrl: e.target.result
                };
            }
        };
        reader.readAsDataURL(file);
    },
    
    /**
     * Собирает данные со всех форм
     * @returns {Array} Массив продуктов
     */
    collectAllFormsData() {
        const products = [];
        
        for (let i = 1; i <= this.currentFormsCount; i++) {
            const product = this.collectFormData(i);
            if (product) {
                products.push(product);
            }
        }
        
        return products;
    },
    
    /**
     * Собирает данные из конкретной формы
     * @param {number} index - Индекс формы
     * @returns {Object|null} Данные продукта или null
     */
    collectFormData(index) {
        const priceValue = document.getElementById(`price${index}`)?.value;
        
        const productData = {
            manufacturer: document.getElementById(`manufacturer${index}`)?.value?.trim() || '',
            country: document.getElementById(`country${index}`)?.value?.trim() || '',
            city: document.getElementById(`city${index}`)?.value?.trim() || '',
            brand: document.getElementById(`brand${index}`)?.value?.trim() || '',
            category: document.getElementById(`category${index}`)?.value?.trim() || '',
            productName: document.getElementById(`productName${index}`)?.value?.trim() || '',
            description: document.getElementById(`description${index}`)?.value?.trim() || '',
            price: priceValue ? parseFloat(priceValue) : 0,
            packaging: document.getElementById(`packaging${index}`)?.value?.trim() || '',
            weight: document.getElementById(`weight${index}`)?.value?.trim() || '',
            composition: document.getElementById(`composition${index}`)?.value?.trim() || '',
            website: document.getElementById(`website${index}`)?.value?.trim() || '',
            photo: this.formsData[index]?.photo || null // Фото опционально
        };
        
        // Проверяем, все ли обязательные поля заполнены (кроме фото)
        const requiredFields = ['manufacturer', 'country', 'city', 'brand', 'category', 
                               'productName', 'description', 'packaging', 'weight', 'composition'];
        
        const hasRequiredFields = requiredFields.every(field => 
            productData[field] && productData[field].toString().trim() !== ''
        );
        
        const hasPrice = productData.price > 0;
        
        // Возвращаем null, если форма пустая или не все обязательные поля заполнены
        if (!hasRequiredFields || !hasPrice) {
            return null;
        }
        
        return productData;
    },
    
    /**
     * Валидирует все формы
     * @returns {boolean} Результат валидации
     */
    validateAllForms() {
        this.resetAllErrors();
        let allValid = true;
        
        // Проверка компании
        const company = document.getElementById('company');
        if (!company.value.trim()) {
            this.showError('company-error', 'Поле "Компания" обязательно для заполнения');
            allValid = false;
        }
        
        // Проверка каждой формы
        for (let i = 1; i <= this.currentFormsCount; i++) {
            const formValid = this.validateForm(i);
            if (!formValid) allValid = false;
        }
        
        // Проверяем, что хотя бы одна форма заполнена
        const filledForms = this.collectAllFormsData().filter(p => p !== null);
        if (filledForms.length === 0) {
            alert('Заполните хотя бы одну форму продукта');
            allValid = false;
        }
        
        return allValid;
    },
    
    /**
     * Валидирует конкретную форму
     * @param {number} index - Индекс формы
     * @returns {boolean} Результат валидации
     */
    validateForm(index) {
        let isValid = true;
        
        // Проверка обязательных полей (кроме фото)
        const requiredFields = [
            { id: `manufacturer${index}`, name: 'Производитель' },
            { id: `country${index}`, name: 'Страна' },
            { id: `city${index}`, name: 'Город' },
            { id: `brand${index}`, name: 'Бренд' },
            { id: `category${index}`, name: 'Категория продукта' },
            { id: `productName${index}`, name: 'Название продукта' },
            { id: `description${index}`, name: 'Описание продукта' },
            { id: `packaging${index}`, name: 'Фасовка, упаковка' },
            { id: `weight${index}`, name: 'Вес/Объем' },
            { id: `composition${index}`, name: 'Состав' }
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                this.showError(`${field.id}-error`, `Поле "${field.name}" обязательно для заполнения`);
                isValid = false;
            }
        });
        
        // Проверка цены
        const price = document.getElementById(`price${index}`);
        if (price) {
            const priceValue = parseFloat(price.value);
            if (!price.value || isNaN(priceValue) || priceValue <= 0) {
                this.showError(`price${index}-error`, 'Пожалуйста, введите корректную цену (число больше 0)');
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    /**
     * Сбрасывает все ошибки
     */
    resetAllErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        
        document.querySelectorAll('input, textarea').forEach(field => {
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
        });
    },
    
    /**
     * Показывает ошибку
     */
    showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (!errorElement) return;
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        const fieldId = errorId.replace('-error', '');
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#e74c3c';
            field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        }
    },
    
    /**
     * Скрывает ошибку
     */
    hideError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (!errorElement) return;
        
        errorElement.style.display = 'none';
        
        const fieldId = errorId.replace('-error', '');
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
        }
    },
    
    /**
     * Очищает все формы
     */
    clearAllForms() {
        // Очищаем все поля кроме компании
        for (let i = 1; i <= this.currentFormsCount; i++) {
            const fields = [
                `manufacturer${i}`, `country${i}`, `city${i}`, `brand${i}`,
                `category${i}`, `productName${i}`, `description${i}`,
                `price${i}`, `packaging${i}`, `weight${i}`, `composition${i}`,
                `website${i}`
            ];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = '';
            });
            
            // Сбрасываем фото
            const photoInput = document.getElementById(`photo${i}`);
            if (photoInput) photoInput.value = '';
            
            const previewImage = document.getElementById(`previewImage${i}`);
            if (previewImage) previewImage.src = '';
            
            const photoPreview = document.getElementById(`photoPreview${i}`);
            if (photoPreview) photoPreview.style.display = 'none';
        }
        
        // Очищаем временные данные
        this.formsData = {};
        this.resetAllErrors();
        
        // Сбрасываем количество форм до 1
        while (this.currentFormsCount > 1) {
            const form = document.querySelector(`[data-product-index="${this.currentFormsCount}"]`);
            if (form) form.remove();
            this.currentFormsCount--;
        }
        
        this.updateAddButton();
    },
    
    /**
     * Заполняет демо-данные
     */
    fillDemoData() {
        if (!confirm("Заполнить все формы демо-данными для тестирования?")) return;
        
        // Очищаем все формы
        this.clearAllForms();
        
        // Заполняем компанию
        document.getElementById('company').value = "ООО 'Молпродукт'";
        
        // Заполняем первую форму
        const demoProduct = {
            manufacturer: "ООО 'Молпродукт'",
            country: "Россия",
            city: "Москва",
            brand: "Молочная долина",
            category: "Молочные продукты",
            productName: "Йогурт натуральный питьевой 2,5%",
            description: "Натуральный питьевой йогурт без добавок",
            price: "89.99",
            packaging: "Пластиковая бутылка с крышкой",
            weight: "450 мл",
            composition: "Молоко нормализованное, закваска молочнокислых культур",
            website: "molochnayadolina.ru"
        };
        
        Object.entries(demoProduct).forEach(([key, value]) => {
            const element = document.getElementById(`${key}1`);
            if (element) element.value = value;
        });
        
        console.log("Формы заполнены демо-данными");
    }
};

/**
 * Основная функция инициализации
 */
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем хранилище
    ProductStorage.init();
    
    // Инициализируем менеджер форм
    ProductFormsManager.init();
    
    // Кнопка сохранения в БД
    const submitToDatabase = document.getElementById('submitToDatabase');
    if (submitToDatabase) {
        submitToDatabase.addEventListener('click', () => {
            // Валидация всех форм
            if (!ProductFormsManager.validateAllForms()) {
                console.log('Формы содержат ошибки. Объект не создан.');
                return;
            }
            
            // Сбор данных
            const companyName = document.getElementById('company').value.trim();
            const products = ProductFormsManager.collectAllFormsData();
            
            // Проверка наличия компании
            if (!companyName) {
                alert('Введите название компании');
                return;
            }
            
            // Проверка наличия продуктов
            const validProducts = products.filter(p => p !== null);
            if (validProducts.length === 0) {
                alert('Заполните хотя бы один продукт');
                return;
            }
            
            try {
                // Сохраняем компанию с продуктами
                const company = ProductStorage.saveCompanyProducts(companyName, validProducts);
                
                // ВЫВОД ИТОГОВОГО ОБЪЕКТА В КОНСОЛЬ
                console.log('=== ИТОГОВЫЙ ОБЪЕКТ КОМПАНИИ ===');
                console.log('Структура сохраненного объекта:');
                console.log(JSON.stringify(company, null, 2));
                
                // Подробный вывод с разбивкой
                console.log('\n--- Детализация объекта ---');
                console.log(`Название компании: ${company.name}`);
                console.log(`Event ID: ${company.eventId}`);
                console.log(`Дата создания: ${new Date(company.createdAt).toLocaleString('ru-RU')}`);
                console.log(`Дата изменения: ${new Date(company.editedAt).toLocaleString('ru-RU')}`);
                console.log(`Количество продуктов: ${company.products.length}`);
                
                console.log('\n--- Список продуктов ---');
                company.products.forEach((product, index) => {
                    console.log(`\nПродукт ${index + 1}:`);
                    console.log(`  Название: ${product.productName}`);
                    console.log(`  Производитель: ${product.manufacturer}`);
                    console.log(`  Бренд: ${product.brand}`);
                    console.log(`  Цена: ${product.price} руб.`);
                    console.log(`  Вес/Объем: ${product.weight}`);
                    console.log(`  Есть фото: ${product.photo ? 'Да' : 'Нет'}`);
                });
                
                console.log('\n--- Проверка структуры ---');
                console.log('Компания имеет eventId:', company.eventId === 51);
                console.log('Продукты НЕ имеют eventId:', company.products.every(p => !p.hasOwnProperty('eventId')));
                console.log('Объект сохранен в localStorage:', true);
                console.log('===============================');
                
                // Показываем сообщение об успехе
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.innerHTML = `
                        <i class="fas fa-check-circle"></i> 
                        Данные успешно сохранены!<br>
                        Компания: <strong>${companyName}</strong><br>
                        Event ID: <strong>${ProductStorage.EVENT_ID}</strong><br>
                        Количество продуктов: <strong>${validProducts.length}</strong><br>
                        <small>Объект выведен в консоль браузера (F12)</small>
                    `;
                    successMessage.style.display = 'block';
                    
                    // Прокрутка к сообщению
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 8000);
                }
                
                // Очищаем формы для нового ввода
                ProductFormsManager.clearAllForms();
                document.getElementById('company').value = '';
                
            } catch (error) {
                console.error('Ошибка при сохранении компании:', error);
                alert(error.message);
            }
        });
    }
    
    // Демо-данные при двойном клике
    document.querySelector('header').addEventListener('dblclick', () => {
        ProductFormsManager.fillDemoData();
    });
    
    // Выводим инструкции
    console.log('=== Инструкция по использованию ===');
    console.log('1. Введите название компании');
    console.log('2. Заполните форму Продукт 1');
    console.log('3. Нажмите "Добавить продукт" для добавления новых форм');
    console.log('4. Максимум 6 продуктов на компанию');
    console.log('5. Каждую форму можно удалить (кроме первой)');
    console.log('6. Фото продукта - опциональное поле');
    console.log('7. После заполнения всех форм нажмите "Загрузить в базу данных"');
    console.log('8. Компания создается с eventId = 51 (продукты БЕЗ eventId)');
    console.log('9. Для демо-данных дважды кликните по заголовку');
    console.log('10. Итоговый объект будет выведен в консоль (F12)');
    console.log('===============================');
});