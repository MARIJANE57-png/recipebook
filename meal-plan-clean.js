// Meal Plan JavaScript - Recipe Society - CLEAN VERSION (NO ALERTS)

const API_URL = 'https://recipe-api-pqbr.onrender.com';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

let mealPlan = {};
let allRecipes = [];
let currentAddingSlot = null;
let dinnerOnlyMode = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadMealPlan();
    loadRecipes();
    renderMealCards();
    setupEventListeners();
});

function loadMealPlan() {
    const saved = localStorage.getItem('mealPlan');
    if (saved) {
        mealPlan = JSON.parse(saved);
    } else {
        DAYS.forEach(day => {
            mealPlan[day] = {
                breakfast: null,
                lunch: null,
                dinner: null
            };
        });
    }
}

function saveMealPlan() {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
}

function loadRecipes() {
    const recipes = localStorage.getItem('recipes');
    if (recipes) {
        allRecipes = JSON.parse(recipes);
    }
}

function renderMealCards() {
    const grid = document.getElementById('mealCardsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    DAYS.forEach(day => {
        const card = createDayCard(day);
        grid.appendChild(card);
    });
}

function createDayCard(day) {
    const card = document.createElement('div');
    card.className = 'day-card';
    
    const header = document.createElement('div');
    header.className = 'day-card-header';
    header.textContent = day;
    card.appendChild(header);

    MEALS.forEach(meal => {
        const slot = createMealSlot(day, meal);
        card.appendChild(slot);
    });

    return card;
}

function createMealSlot(day, meal) {
    const slot = document.createElement('div');
    slot.className = 'meal-slot';
    slot.setAttribute('data-meal', meal);

    const label = document.createElement('div');
    label.className = 'meal-slot-label';
    label.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
    slot.appendChild(label);

    const content = document.createElement('div');
    content.className = 'meal-slot-content';

    const currentMeal = mealPlan[day]?.[meal];
    
    if (currentMeal) {
        const mealItem = document.createElement('div');
        mealItem.className = 'meal-item';
        
        const mealName = document.createElement('span');
        mealName.className = 'meal-item-name';
        mealName.textContent = currentMeal.title || currentMeal;
        mealItem.appendChild(mealName);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'meal-item-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = function() {
            removeMeal(day, meal);
        };
        mealItem.appendChild(removeBtn);

        content.appendChild(mealItem);
    } else {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-meal-btn';
        addBtn.textContent = 'Add';
        addBtn.onclick = function() {
            openAddMealModal(day, meal);
        };
        content.appendChild(addBtn);
    }

    slot.appendChild(content);
    return slot;
}

function openAddMealModal(day, meal) {
    currentAddingSlot = { day: day, meal: meal };
    
    const modal = document.getElementById('addMealModal');
    if (!modal) return;
    
    const title = document.getElementById('addMealTitle');
    if (title) {
        title.textContent = 'Add ' + meal.charAt(0).toUpperCase() + meal.slice(1) + ' for ' + day;
    }
    
    renderRecipePicker();
    modal.classList.remove('hidden');
}

function renderRecipePicker(searchTerm) {
    const list = document.getElementById('recipePickerList');
    if (!list) return;
    
    if (allRecipes.length === 0) {
        list.innerHTML = '<div class="empty-meal-plan"><h3>No recipes yet!</h3><p>Add some recipes to your Recipe Book first.</p></div>';
        return;
    }

    const filtered = searchTerm
        ? allRecipes.filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        : allRecipes;

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-meal-plan"><p>No recipes found.</p></div>';
        return;
    }

    list.innerHTML = '';
    filtered.forEach(function(recipe) {
        const item = document.createElement('div');
        item.className = 'recipe-picker-item';
        item.onclick = function() {
            addMealToSlot(recipe);
        };

        const titleDiv = document.createElement('div');
        titleDiv.className = 'recipe-picker-item-title';
        titleDiv.textContent = recipe.title || 'Untitled Recipe';
        item.appendChild(titleDiv);

        const source = document.createElement('div');
        source.className = 'recipe-picker-item-source';
        source.textContent = recipe.source || 'Recipe';
        item.appendChild(source);

        list.appendChild(item);
    });
}

function addMealToSlot(recipe) {
    if (!currentAddingSlot) return;

    const day = currentAddingSlot.day;
    const meal = currentAddingSlot.meal;
    
    mealPlan[day][meal] = {
        id: recipe.id,
        title: recipe.title
    };
    
    saveMealPlan();
    closeAddMealModal();
    renderMealCards();
}

function removeMeal(day, meal) {
    mealPlan[day][meal] = null;
    saveMealPlan();
    renderMealCards();
}

function closeAddMealModal() {
    const modal = document.getElementById('addMealModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentAddingSlot = null;
}

function toggleDinnerOnly() {
    dinnerOnlyMode = !dinnerOnlyMode;
    const btn = document.getElementById('dinnerOnlyToggle');
    
    if (dinnerOnlyMode) {
        document.body.classList.add('dinner-only-mode');
        btn.classList.add('active');
    } else {
        document.body.classList.remove('dinner-only-mode');
        btn.classList.remove('active');
    }
}

function clearWeek() {
    if (!confirm('Clear entire week? This cannot be undone.')) return;

    DAYS.forEach(day => {
        MEALS.forEach(meal => {
            mealPlan[day][meal] = null;
        });
    });

    saveMealPlan();
    renderMealCards();
}

function setupEventListeners() {
    // Dinner Only Toggle
    const dinnerBtn = document.getElementById('dinnerOnlyToggle');
    if (dinnerBtn) {
        dinnerBtn.addEventListener('click', toggleDinnerOnly);
    }

    // Clear Week
    const clearBtn = document.getElementById('clearWeekBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearWeek);
    }

    // Close Add Meal Modal
    const closeBtn = document.getElementById('closeAddMeal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddMealModal);
    }

    // Recipe Search
    const searchInput = document.getElementById('recipePickerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            renderRecipePicker(e.target.value);
        });
    }

    // Close modals on backdrop click
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(function(backdrop) {
        backdrop.addEventListener('click', closeAddMealModal);
    });
}
