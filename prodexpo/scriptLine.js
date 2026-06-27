document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    const photoUpload = document.getElementById('photoUpload');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');
    const resetButton = document.getElementById('resetButton');
    const successMessage = document.getElementById('successMessage');
    const consoleOutput = document.getElementById('consoleOutput');
    
    // Переменная для хранения данных формы
    let productData = {};
    
    // Обработчик загрузки фото
    photoUpload.addEventListener('click', function() {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Проверка размера файла (макс. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('photo-error', 'Файл слишком большой. Максимальный размер: 5MB');
                return;
            }
            
            // Проверка типа файла
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showError('photo-error', 'Неподдерживаемый формат файла. Используйте JPG, PNG или GIF');
                return;
            }
            
            // Показ превью
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                photoPreview.style.display = 'block';
                hideError('photo-error');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Функция сбора данных из формы в объект
    function collectFormData() {
        const websiteInput = document.getElementById('website').value.trim();
        
        const priceValue = document.getElementById('price').value;
        
        const formData = {
            manufacturer: document.getElementById('manufacturer').value.trim(),
            country: document.getElementById('country').value.trim(),
            city: document.getElementById('city').value.trim(),
            brand: document.getElementById('brand').value.trim(),
            category: document.getElementById('category').value,
            productName: document.getElementById('productName').value.trim(),
            description: document.getElementById('description').value.trim(),
            price: priceValue ? parseFloat(priceValue) : 0,
            packaging: document.getElementById('packaging').value.trim(),
            weight: document.getElementById('weight').value.trim(),
            composition: document.getElementById('composition').value.trim(),
            website: websiteInput, // Любое значение как есть
            // Добавляем информацию о файле
            photo: photoInput.files && photoInput.files[0] ? {
                fileName: photoInput.files[0].name,
                fileSize: photoInput.files[0].size,
                fileType: photoInput.files[0].type,
                lastModified: new Date(photoInput.files[0].lastModified).toLocaleString(),
                dataUrl: previewImage.src // Сохраняем Data URL для предпросмотра
            } : null
        };
        
        return formData;
    }
    
    // Функция сохранения данных в localStorage (эмуляция базы данных)
    function saveToLocalStorage(data) {
        // Генерируем уникальный ID для продукта
        const productId = 'product_' + Date.now();
        
        // Сохраняем данные
        localStorage.setItem(productId, JSON.stringify(data));
        
        // Сохраняем ID последнего продукта для быстрого доступа
        localStorage.setItem('lastProductId', productId);
        
        // Сохраняем в список всех продуктов
        let productsList = JSON.parse(localStorage.getItem('productsList') || '[]');
        productsList.push(productId);
        localStorage.setItem('productsList', JSON.stringify(productsList));
        
        return productId;
    }
    
    // Функция форматирования объекта для вывода
    function formatObjectForDisplay(obj) {
        return JSON.stringify(obj, null, 2);
    }
    
    // Функция вывода объекта в консоль и на экран
    function displayProductData(data) {
        // Выводим в консоль браузера
        console.log('=== Данные о продукте ===');
        console.log('Структура объекта:');
        console.log(data);
        console.log('-------------------------');
        console.log('Отдельные поля:');
        for (const [key, value] of Object.entries(data)) {
            if (key === 'photo' && value) {
                console.log(`photo: ${value.fileName} (${(value.fileSize / 1024).toFixed(2)} KB)`);
            } else if (key === 'website' && value === '') {
                console.log(`${key}: (пусто)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }
        console.log('=========================');
        
        // Выводим на экран
        consoleOutput.textContent = formatObjectForDisplay(data);
        consoleOutput.style.display = 'block';
        
        // Прокрутка к выводу
        consoleOutput.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Обработчик отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Сброс предыдущих ошибок
        resetErrors();
        
        // Проверка всех обязательных полей
        let isValid = true;
        
        // Проверка текстовых полей
        const requiredFields = [
            'manufacturer', 'country', 'city', 'brand', 
            'productName', 'description', 'composition',
            'packaging', 'weight'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                showError(`${fieldId}-error`, `Поле "${field.previousElementSibling.textContent.replace(' *', '')}" обязательно для заполнения`);
                isValid = false;
            }
        });
        
        // Проверка категории
        const category = document.getElementById('category');
        if (!category.value) {
            showError('category-error', 'Пожалуйста, выберите категорию продукта');
            isValid = false;
        }
        
        // Проверка цены
        const price = document.getElementById('price');
        const priceValue = parseFloat(price.value);
        if (!price.value || isNaN(priceValue) || priceValue <= 0) {
            showError('price-error', 'Пожалуйста, введите корректную цену (число больше 0)');
            isValid = false;
        }
        
        // Проверка фото
        if (!photoInput.files || photoInput.files.length === 0) {
            showError('photo-error', 'Пожалуйста, загрузите фотографию продукта');
            isValid = false;
        }
        
        // Если форма валидна
        if (isValid) {
            // Собираем данные из формы
            productData = collectFormData();
            
            // Сохраняем в localStorage (эмуляция базы данных)
            const productId = saveToLocalStorage(productData);
            
            // Выводим данные в консоль и на экран
            displayProductData(productData);
            
            // Показываем сообщение об успехе
            successMessage.innerHTML = `<i class="fas fa-check-circle"></i> Данные о продукте успешно сохранены! ID: ${productId}`;
            successMessage.style.display = 'block';
            
            // Прокрутка к сообщению об успехе
            successMessage.scrollIntoView({ behavior: 'smooth' });
            
            console.log('Готово к отправке на сервер!');
            console.log('Объект успешно создан и сохранен:', productData);
            console.log('ID продукта:', productId);
            
            // Сброс формы через 5 секунд
            setTimeout(() => {
                form.reset();
                photoPreview.style.display = 'none';
                successMessage.style.display = 'none';
                consoleOutput.style.display = 'none';
                resetErrors();
                productData = {}; // Очищаем данные
            }, 5000);
        } else {
            console.log('Форма содержит ошибки. Объект не создан.');
        }
    });
    
    // Обработчик сброса формы
    resetButton.addEventListener('click', function() {
        resetErrors();
        photoPreview.style.display = 'none';
        successMessage.style.display = 'none';
        consoleOutput.style.display = 'none';
        productData = {}; // Очищаем данные
    });
    
    // Функции для работы с ошибками
    function showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Подсветка соответствующего поля
        const fieldId = errorId.replace('-error', '');
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#e74c3c';
            field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        }
    }
    
    function hideError(errorId) {
        const errorElement = document.getElementById(errorId);
        errorElement.style.display = 'none';
        
        // Сброс стиля соответствующего поля
        const fieldId = errorId.replace('-error', '');
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
        }
    }
    
    function resetErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.style.display = 'none';
        });
        
        // Сброс стилей всех полей
        const fields = document.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
        });
    }
    
    // Автозаполнение для демонстрации (удобно для тестирования)
    const demoData = {
        manufacturer: "ООО 'Молпродукт'",
        country: "Россия",
        city: "Москва",
        brand: "Молочная долина",
        category: "food",
        productName: "Йогурт натуральный питьевой 2,5%",
        description: "Натуральный питьевой йогурт без добавок, произведенный из отборного молока. Идеален для завтрака и перекуса. Содержит живые молочнокислые бактерии, способствующие улучшению пищеварения.",
        price: "89.99",
        packaging: "Пластиковая бутылка с крышкой",
        weight: "450 мл",
        composition: "Молоко нормализованное, закваска молочнокислых культур (Streptococcus thermophilus, Lactobacillus bulgaricus). Без консервантов, красителей и искусственных добавок.",
        website: "molochnayadolina.ru"
    };
    
    // Автозаполнение формы при двойном клике на заголовок
    document.querySelector('header').addEventListener('dblclick', function() {
        if (confirm("Заполнить форму демо-данными для тестирования?")) {
            Object.keys(demoData).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = demoData[key];
            });
            
            // Для категории (select)
            document.getElementById('category').value = demoData.category;
            
            console.log("Форма заполнена демо-данными. Не забудьте загрузить тестовое изображение!");
            
            // Создаем фиктивный файл для демонстрации
            const mockFile = new File([""], "product_photo.jpg", { 
                type: "image/jpeg",
                lastModified: new Date()
            });
            
            // Создаем DataTransfer для эмуляции загрузки файла
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(mockFile);
            photoInput.files = dataTransfer.files;
            
            // Показываем превью
            previewImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNGI2Y2I3Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWtkZGxlIiB0ZXh0LWFuY2hvcj0ibWtkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0Ij5EZW1vIFBob3RvPC90ZXh0Pgo8L3N2Zz4K";
            photoPreview.style.display = 'block';
            
            console.log("Демо-фото загружено!");
        }
    });
    
    // Дополнительные тесты
    console.log("Для тестирования формы:");
    console.log("1. Заполните форму и нажмите 'Сохранить продукт'");
    console.log("2. Проверьте консоль браузера (F12) для просмотра объекта");
    console.log("3. Перейдите на страницу карточки товара по ссылке выше");
});