import { procurementData } from './data.js';

// Константы для работы с таблицей
const STATUSES = ["На согласовании", "Ожидается", "Завершено", "В процессе", "Просрочено"];

// Глобальные переменные для таблицы
let currentSortField = null;
let sortDirection = 'asc';
let currentSupplierFilter = null;

// Маппинг статусов для сортировки
const statusOrder = {
  "В процессе": 1,
  "На согласовании": 2,
  "Ожидается": 3,
  "Завершено": 4,
  "Просрочено": 5
};

// Маппинг цветов для статусов (для кружков)
const statusColors = {
  "В процессе": "#0471ff",  
  "На согласовании": "#98f040", 
  "Ожидается": "#686868",  
  "Завершено": "#0a837d",  
  "Просрочено": "#e03456" 
};

// Главная функция инициализации таблицы
function initTable() {
  console.log('Инициализация таблицы...');
  console.log('Закупщик:', procurementData.purchaserName);
  console.log('Дата создания:', procurementData.creationDate);
  console.log('Количество закупок:', procurementData.purchases.length);

  populateTable();
  initializeTableSorting();
  initializeSupplierFilter();
  updateTableTitle();
  updateCounters();

  // Инициализируем обработчик для выбора категории
  const categorySelect = document.getElementById('category');
  if (categorySelect) {
    categorySelect.addEventListener('change', function () {
      // Если категория меняется, сбрасываем фильтр поставщика
      currentSupplierFilter = null;
      updateSupplierFilterButton();
      populateTable();
      updateCounters();
      // Обновляем график если он существует
      if (typeof renderChart === 'function') {
        renderChart();
      }
    });
  }
  
  // Инициализация адаптивных стилей
  initResponsiveStyles();
}

// Инициализация адаптивных стилей
function initResponsiveStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .table {
        font-size: 10px  ;
      }
      
      .table th:nth-child(4),  /* Столбец "Сумма" */
      .table td:nth-child(4),
      .table th:nth-child(5),  /* Столбец "Дата" */
      .table td:nth-child(5) {
        width: 64px  ;
        min-width: 64px  ;
        max-width: 64px  ;
      }
      
      .table th,
      .table td {
        padding: 4px 2px  ;
      }
      
      .table-wrap {
        overflow-x: auto;
      }
      
      .status-text {
        font-size: 9px  ;
      }
      
      .status-indicator {
        width: 6px  ;
        height: 6px  ;
        margin-right: 3px  ;
      }
    }
    
    @media (max-width: 460px) {
      .table {
        font-size: 9px  ;
      }
      
      .status-container {
        flex-direction: column  ;
        align-items: center  ;
        justify-content: center  ;
        gap: 2px  ;
      }
      
      .status-indicator {
        margin-right: 0  ;
        margin-bottom: 2px  ;
        width: 8px  ;
        height: 8px  ;
      }
      
      .status-text {
        font-size: 8px  ;
        text-align: center  ;
        line-height: 1  ;
      }
      
      .table th,
      .table td {
        padding: 3px 1px  ;
      }
      
      .table th:nth-child(4),
      .table td:nth-child(4),
      .table th:nth-child(5),
      .table td:nth-child(5) {
        width: 56px  ;
        min-width: 56px  ;
        max-width: 56px  ;
      }
      
      .table th:nth-child(3),
      .table td:nth-child(3) {
        min-width: 70px  ;
      }
    }
  `;
  document.head.appendChild(style);
}

// Инициализация при полной загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTable);
} else {
  initTable();
}

// Обновление заголовка таблицы
function updateTableTitle() {
  const tableTitle = document.querySelector('.table-block__title');
  if (tableTitle) {
    let title = 'Текущие закупки';
    if (currentSupplierFilter) {
      title += ` (фильтр: ${currentSupplierFilter})`;
    }
    tableTitle.textContent = `${title} (${getFilteredPurchases().length})`;
  }
}

// Получение отфильтрованных закупок (доступно для других скриптов)
function getFilteredPurchases() {
  let filteredPurchases = [...procurementData.purchases];

  // Применяем фильтр по поставщику
  if (currentSupplierFilter) {
    filteredPurchases = filteredPurchases.filter(purchase =>
      purchase.supplier === currentSupplierFilter
    );
  }

  // Применяем фильтр по категории
  const selectedCategory = document.getElementById('category')?.value;
  if (selectedCategory && selectedCategory !== 'Молочная продукция') {
    if (selectedCategory === 'Овощи и фрукты') {
      filteredPurchases = filteredPurchases.filter(purchase =>
        purchase.product.toLowerCase().includes('овощ') ||
        purchase.product.toLowerCase().includes('фрукт')
      );
    } else if (selectedCategory === 'Напитки') {
      filteredPurchases = filteredPurchases.filter(purchase =>
        purchase.product.toLowerCase().includes('напиток') ||
        purchase.product.toLowerCase().includes('сок')
      );
    }
  }

  return filteredPurchases;
}

// Обновление счетчиков статусов
function updateCounters() {
  const purchases = getFilteredPurchases();

  // Создаем объект для хранения количества записей по статусам
  const statusCounts = {};
  STATUSES.forEach(status => {
    statusCounts[status] = 0;
  });

  // Считаем количество записей по каждому статусу
  purchases.forEach(purchase => {
    if (statusCounts[purchase.status] !== undefined) {
      statusCounts[purchase.status]++;
    }
  });

  // Обновляем значения в стат-блоках
  const statBlocks = document.querySelectorAll('.stat');
  if (statBlocks.length >= 3) {
    // Активные заявки (В процессе + На согласовании)
    if (statBlocks[0]) {
      const activeCount = statusCounts["В процессе"] + statusCounts["На согласовании"];
      statBlocks[0].querySelector('.stat__value').textContent = activeCount;
      // Обновляем stat__chip для первого блока
      if (statBlocks[0].querySelector('.stat__chip')) {
        statBlocks[0].querySelector('.stat__chip').textContent = statusCounts["В процессе"];
      }
    }

    // На согласовании
    if (statBlocks[1]) {
      statBlocks[1].querySelector('.stat__value').textContent = statusCounts["На согласовании"];
      // Обновляем stat__chip для второго блока
      if (statBlocks[1].querySelector('.stat__chip')) {
        statBlocks[1].querySelector('.stat__chip').textContent = statusCounts["На согласовании"];
      }
    }

    // Требует внимания (Просрочено)
    if (statBlocks[2]) {
      statBlocks[2].querySelector('.stat__value').textContent = statusCounts["Просрочено"];
      // Обновляем stat__chip для третьего блока
      if (statBlocks[2].querySelector('.stat__chip')) {
        statBlocks[2].querySelector('.stat__chip').textContent = statusCounts["Просрочено"];
      }

      // Добавляем или убираем класс alert в зависимости от наличия просроченных
      const statValueElement = statBlocks[2].querySelector('.stat__value');
      if (statusCounts["Просрочено"] > 0) {
        statValueElement.classList.add('stat__value--red');
      } else {
        statValueElement.classList.remove('stat__value--red');
      }
    }
  }
}

// Заполнение таблицы данными
function populateTable(sortField = null, direction = 'asc') {
  const tbody = document.querySelector('.table tbody');
  if (!tbody) return;

  // Получаем отфильтрованные данные
  let dataToDisplay = getFilteredPurchases();

  // Сортируем данные если нужно
  if (sortField) {
    dataToDisplay = sortPurchases(dataToDisplay, sortField, direction);
  }

  // Очищаем таблицу
  tbody.innerHTML = '';

  // Заполняем таблицу данными
  dataToDisplay.forEach(purchase => {
    const row = document.createElement('tr');

    // Получаем цвет для статуса
    const statusColor = statusColors[purchase.status] || '#cccccc';

    // Форматируем сумму с пробелами
    const formattedAmount = formatCurrency(parseInt(purchase.amount));

    // Проверяем, активен ли фильтр для этого поставщика
    const isActiveFilter = currentSupplierFilter === purchase.supplier;
    const activeClass = isActiveFilter ? 'active-filter' : '';

    row.innerHTML = `
      <td>${purchase.product}</td>
      <td>
        <span class="supplier-link ${activeClass}" data-supplier="${purchase.supplier}">
          ${purchase.supplier}
        </span>
      </td>
      <td>
        <div class="status-container" style="display: flex; align-items: center; gap: 6px;">
          <span class="status-indicator" style="
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 2px;
            background-color: ${statusColor};
            flex-shrink: 0;
          "></span>
          <span class="status-text">${purchase.status}</span>
        </div>
      </td>
      <td>${formattedAmount} ₽</td>
      <td>${purchase.deliveryDate}</td>
    `;

    tbody.appendChild(row);
  });

  // Добавляем обработчики кликов на поставщиков
  addSupplierClickHandlers();
}

// Форматирование валюты
function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '&nbsp;');
}

// Сортировка закупок
function sortPurchases(purchases, field, direction = 'asc') {
  return [...purchases].sort((a, b) => {
    let aValue, bValue;

    switch (field) {
      case 'status':
        // Используем порядок статусов для сортировки
        aValue = statusOrder[a.status] || 99;
        bValue = statusOrder[b.status] || 99;
        break;
      case 'amount':
        aValue = parseInt(a.amount);
        bValue = parseInt(b.amount);
        break;
      case 'deliveryDate':
        // Конвертируем даты в timestamp для сортировки
        aValue = parseDateToTimestamp(a.deliveryDate);
        bValue = parseDateToTimestamp(b.deliveryDate);
        break;
      default:
        return 0;
    }

    // Сравниваем значения
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;

    // Инвертируем для обратной сортировки
    return direction === 'desc' ? comparison * -1 : comparison;
  });
}

// Парсинг даты в timestamp
function parseDateToTimestamp(dateStr) {
  if (!dateStr) return 0;

  // Формат DD.MM.YYYY
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    return new Date(year, month, day).getTime();
  }

  return 0;
}

// Инициализация сортировки таблицы
function initializeTableSorting() {
  const table = document.querySelector('.table');
  if (!table) return;

  const headers = table.querySelectorAll('thead th');

  headers.forEach((header, index) => {
    const headerText = header.textContent.trim();

    // Добавляем сортировку только для нужных колонок
    if (headerText === 'Статус' || headerText === 'Сумма' || headerText === 'Срок поставки') {
      header.style.cursor = 'pointer';
      header.style.position = 'relative';
      header.setAttribute('data-sortable', 'true');

      // Добавляем индикатор сортировки
      const sortIndicator = document.createElement('span');
      sortIndicator.className = 'sort-indicator';
      sortIndicator.innerHTML = '↕';
      sortIndicator.style.marginLeft = '5px';
      sortIndicator.style.opacity = '0.5';
      header.appendChild(sortIndicator);

      header.addEventListener('click', () => {
        let field;
        switch (headerText) {
          case 'Статус':
            field = 'status';
            break;
          case 'Сумма':
            field = 'amount';
            break;
          case 'Срок поставки':
            field = 'deliveryDate';
            break;
        }

        // Определяем направление сортировки
        if (currentSortField === field) {
          // Переключаем направление
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          // Новая сортировка
          currentSortField = field;
          sortDirection = 'asc';
        }

        // Обновляем индикаторы
        updateSortIndicators(field, sortDirection);

        // Сортируем и перерисовываем таблицу
        populateTable(field, sortDirection);
      });
    }
  });
}

// Обновление индикаторов сортировки
function updateSortIndicators(field, direction) {
  const headers = document.querySelectorAll('.table thead th[data-sortable="true"]');

  headers.forEach(header => {
    const indicator = header.querySelector('.sort-indicator');
    const headerText = header.textContent.replace('↕', '').replace('↑', '').replace('↓', '').trim();

    let currentField;
    switch (headerText) {
      case 'Статус':
        currentField = 'status';
        break;
      case 'Сумма':
        currentField = 'amount';
        break;
      case 'Срок поставки':
        currentField = 'deliveryDate';
        break;
    }

    if (currentField === field) {
      indicator.innerHTML = direction === 'asc' ? '↑' : '↓';
      indicator.style.opacity = '1';
      indicator.style.color = '#0B63A8';
    } else {
      indicator.innerHTML = '↕';
      indicator.style.opacity = '0.5';
      indicator.style.color = 'inherit';
    }
  });
}

// Инициализация фильтра по поставщикам
function initializeSupplierFilter() {
  // Создаем кнопку для сброса фильтра
  const filterControls = document.createElement('div');
  filterControls.className = 'supplier-filter-controls';
  filterControls.style.marginBottom = '15px';
  filterControls.style.display = 'flex';
  filterControls.style.alignItems = 'center';
  filterControls.style.gap = '10px';
  filterControls.style.flexWrap = 'wrap';

  const resetButton = document.createElement('button');
  resetButton.className = 'btn btn--outline';
  resetButton.id = 'resetSupplierFilter';
  resetButton.textContent = 'Все поставщики';
  resetButton.style.display = 'none';

  const filterInfo = document.createElement('div');
  filterInfo.className = 'supplier-filter-info';
  filterInfo.style.fontSize = '14px';
  filterInfo.style.color = '#666';
  filterInfo.textContent = 'Кликните на имя поставщика для фильтрации';

  filterControls.appendChild(resetButton);
  filterControls.appendChild(filterInfo);

  // Вставляем перед таблицей
  const tableBlock = document.querySelector('.table-block');
  const tableWrap = document.querySelector('.table-wrap');
  if (tableBlock && tableWrap) {
    const existingControls = tableBlock.querySelector('.supplier-filter-controls');
    if (!existingControls) {
      tableBlock.insertBefore(filterControls, tableWrap);
    }
  }

  // Обработчик для кнопки сброса
  resetButton.addEventListener('click', () => {
    currentSupplierFilter = null;
    updateSupplierFilterButton();
    populateTable();
    updateTableTitle();
    updateCounters();
    if (typeof renderChart === 'function') {
      renderChart();
    }
  });

  updateSupplierFilterButton();
}

// Добавление обработчиков кликов на поставщиков
function addSupplierClickHandlers() {
  const supplierLinks = document.querySelectorAll('.supplier-link');

  supplierLinks.forEach(link => {
    link.style.cursor = 'pointer';
    link.style.color = '#0B63A8';
    link.style.textDecoration = 'underline';
    link.style.textDecorationStyle = 'dotted';

    const supplier = link.getAttribute('data-supplier');
    if (currentSupplierFilter === supplier) {
      link.classList.add('active-filter');
    } else {
      link.classList.remove('active-filter');
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const supplier = link.getAttribute('data-supplier');

      if (currentSupplierFilter === supplier) {
        currentSupplierFilter = null;
      } else {
        currentSupplierFilter = supplier;
      }

      updateSupplierFilterButton();
      populateTable();
      updateTableTitle();
      updateCounters();
      if (typeof renderChart === 'function') {
        renderChart();
      }
    });
  });
}

// Обновление кнопки фильтра поставщика
function updateSupplierFilterButton() {
  const resetButton = document.getElementById('resetSupplierFilter');
  const filterInfo = document.querySelector('.supplier-filter-info');

  if (resetButton && filterInfo) {
    if (currentSupplierFilter) {
      resetButton.style.display = 'inline-block';
      resetButton.textContent = `Сбросить фильтр (${currentSupplierFilter})`;
      filterInfo.textContent = `Показаны товары поставщика: ${currentSupplierFilter}`;
      filterInfo.style.color = '#0B63A8';
      filterInfo.style.fontWeight = '500';
      filterInfo.style.borderLeftColor = '#0B63A8';
    } else {
      resetButton.style.display = 'none';
      filterInfo.textContent = 'Кликните на имя поставщика для фильтрации';
      filterInfo.style.color = '#666';
      filterInfo.style.fontWeight = 'normal';
      filterInfo.style.borderLeftColor = '#0B63A8';
    }
  }
}

// Добавляем кастомные стили для таблицы
function addTableStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .table thead th[data-sortable="true"] {
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-right: 25px  ;
    }
    
    .table thead th[data-sortable="true"]:hover {
      background-color: #f0f7ff;
    }
    
    .sort-indicator {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);      
      transition: all 0.2s;
    }
    
    .table-wrap {
      max-height: 340px;
      overflow-y: auto;
      position: relative;
    }
    
    .table-wrap::-webkit-scrollbar {
      width: 8px;
    }
    
    .table-wrap::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .table-wrap::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .table-wrap::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    .table thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #fff;
      box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
    }
    
    .supplier-link {
      cursor: pointer;
      color: var(--blue-900);
      text-decoration: underline;
      text-decoration-style: dotted;
      transition: all 0.2s;
      padding: 2px 4px;
      border-radius: 4px;
    }
    
    .supplier-link:hover {
      color: var(--blue-900);
      text-decoration-style: solid;
      background-color: #f0f7ff;
    }
    
    .supplier-filter-controls {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    #resetSupplierFilter {
      background-color: var(--lightBlue);
      border-color: var(--blue-900);
      color: var(--blue-900);
      padding: 8px 16px;
    }
    
    #resetSupplierFilter:hover {
      background-color: var(--progress-soft);
      transform: translateY(-1px);
    }
    
    .supplier-filter-info {
      color: #666;
      padding: 8px 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--blue-900);
      transition: all 0.3s ease;
    }
    
    .supplier-link.active-filter {
      color: var(--blue-900);
      background-color: var(--progress-soft);
      padding: 2px 8px;
      border-radius: 4px;
      text-decoration: none;
    }
    
    .stat__value {
      font-size: 2.5rem  ;
      font-weight: 600;
      text-align: center;
      color: var(--grey);
    }
    
    .stat__value--red {
      color: var(--danger);
    }
    
    .stat__value::after {
      content: '';
    }
    
    .status-container {
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 20px;
    }
    
    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      flex-shrink: 0;
    }
    
    .status-text {
      font-size: 12px;
      color: #1E1E1E;
      line-height: 1.2;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .supplier-filter-controls {
      animation: fadeIn 0.3s ease-out;
    }
    
    .supplier-filter-info.active-filter::before {
      content: "✅ ";
    }
    
    @media (max-width: 768px) {
      .supplier-filter-controls {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .table {
        font-size: 10px;
      }
      
      .table th,
      .table td {
        padding: 4px 2px;
      }
      
      .table th:nth-child(4),
      .table td:nth-child(4),
      .table th:nth-child(5),
      .table td:nth-child(5) {
        width: 64px;
        min-width: 64px;
        max-width: 64px;
      }
      
      .stat__value {
        font-size: 2rem  ;
      }
      
      .supplier-filter-info {
        width: 100%;
        text-align: center;
        font-size: 12px;
      }
      
      .status-text {
        font-size: 9px;
      }
      
      .status-indicator {
        width: 6px;
        height: 6px;
        margin-right: 3px;
      }
      
      .table-wrap {
        overflow-x: auto;
      }
    }
    
    @media (max-width: 460px) {
      .table {
        font-size: 9px;
      }
      
      .status-container {
        flex-direction: column  ;
        align-items: center  ;
        justify-content: center  ;
        gap: 2px  ;
        min-height: 30px  ;
      }
      
      .status-indicator {
        margin-right: 0  ;
        margin-bottom: 2px  ;
        width: 8px  ;
        height: 8px  ;
        order: 1  ;
      }
      
      .status-text {
        font-size: 8px  ;
        text-align: center  ;
        line-height: 1  ;
        order: 2  ;
        max-width: 60px  ;
        word-break: break-word  ;
      }
      
      .table th,
      .table td {
        padding: 3px 1px  ;
      }
      
      .table th:nth-child(4),
      .table td:nth-child(4),
      .table th:nth-child(5),
      .table td:nth-child(5) {
        width: 56px  ;
        min-width: 56px  ;
        max-width: 56px  ;
      }
      
      .table th:nth-child(3),
      .table td:nth-child(3) {
        min-width: 70px  ;
        max-width: 70px  ;
      }
      
      .supplier-filter-controls {
        margin-bottom: 10px  ;
      }
      
      .supplier-filter-info {
        padding: 6px 10px  ;
        font-size: 10px  ;
      }
      
      #resetSupplierFilter {
        padding: 6px 10px  ;
        font-size: 11px  ;
      }
    }
  `;
  document.head.appendChild(style);
}

// Инициализация стилей
addTableStyles();

function updateSupplierFilter(supplier) {
  currentSupplierFilter = supplier;
  if (typeof window.updateSupplierFilter === 'function') {
    window.updateSupplierFilter(supplier);
  }
  populateTable();
  updateTableTitle();
  updateCounters();
}

export {
  getFilteredPurchases,
  STATUSES,
  procurementData,
  initTable,
  updateCounters
};

window.getFilteredPurchases = getFilteredPurchases;
window.STATUSES = STATUSES;
window.procurementData = procurementData;