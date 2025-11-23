// Meal Plan - Weekly Planning

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

let currentDay = '';
let currentMeal = '';
let currentSuggestions = null;

// Get recipes from localStorage
function getRecipes() {
    try {
        const recipesData = localStorage.getItem('recipes');

        if (!recipesData) {
            return [];
        }

        // Check data size (if over 4MB, clear it)
        if (recipesData.length > 4000000) {
            console.warn('Recipe data too large - clearing');
            localStorage.removeItem('recipes');
            alert('Recipe storage was too full. Please re-add recipes.');
            return [];
        }

        const recipes = JSON.parse(recipesData);

        // Remove any image data
        const cleanedRecipes = recipes.map(recipe => {
            const { thumbnailUrl, image, ...clean } = recipe;
            return clean;
        });

        // Limit to first 100 recipes for performance
        return cleanedRecipes.slice(0, 100);
    } catch (error) {
        console.error('Error loading recipes:', error);
        localStorage.removeItem('recipes');
        return [];
    }
}

// Get meal plan from localStorage
function getMealPlan() {
    try {
        const mealPlan = localStorage.getItem('mealPlan');
        return mealPlan ? JSON.parse(mealPlan) : {};
    } catch (error) {
        console.error('Error loading meal plan:', error);
        return {};
    }
}

// Save meal plan to localStorage
function saveMealPlan(mealPlan) {
    try {
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        return true;
    } catch (error) {
        console.error('Error saving meal plan:', error);
        return false;
    }
}

// Display meal plan grid
function displayMealPlan() {
    const mealPlan = getMealPlan();
    const mealPlanGrid = document.getElementById('mealPlanGrid');

    if (!mealPlanGrid) {
        console.error('mealPlanGrid element not found');
        return;
    }

    mealPlanGrid.innerHTML = DAYS.map(day => {
        const dayPlan = mealPlan[day] || {};

        return `
            <div class="day-card">
                <h3>${day}</h3>
                <div class="meal-slots">
                    ${MEALS.map(meal => {
                        const recipeId = dayPlan[meal];
                        const recipe = recipeId ? getRecipeById(recipeId) : null;

                        return `
                            <div class="meal-slot ${recipe ? 'has-recipe' : ''}">
                                <h4>${meal}</h4>
                                ${recipe ? `
                                    <div class="meal-recipe">
                                        <span>${recipe.title}</span>
                                        <button class="btn-small btn-delete" onclick="event.stopPropagation(); removeMeal('${day}', '${meal}'); return false;">Remove</button>
                                    </div>
                                ` : `
                                    <button class="btn-secondary" onclick="event.stopPropagation(); openRecipeSelector('${day}', '${meal}'); return false;">+ Add Recipe</button>
                                `}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Get recipe by ID
function getRecipeById(recipeId) {
    const recipes = getRecipes();
    return recipes.find(r => r.id === recipeId);
}

// Render recipe list with search filter
function renderRecipeList(searchTerm = '') {
    const recipes = getRecipes();
    const recipeSelectList = document.getElementById('recipeSelectList');

    if (!recipeSelectList) return;

    // Filter recipes
    let filtered = recipes;
    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = recipes.filter(r =>
            (r.title || '').toLowerCase().includes(search)
        );
    }

    // Limit to 30 recipes
    const limited = filtered.slice(0, 30);

    if (limited.length === 0) {
        recipeSelectList.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: #999; margin-bottom: 20px;">${searchTerm ? 'No recipes found' : 'No recipes available'}</p>
                <a href="index-import.html" class="btn-primary">Add a Recipe</a>
            </div>
        `;
        return;
    }

    recipeSelectList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    limited.forEach((recipe) => {
        const div = document.createElement('div');
        div.className = 'recipe-select-item';

        const title = document.createElement('h4');
        title.textContent = recipe.title || 'Untitled Recipe';

        const desc = document.createElement('p');
        const fullDesc = recipe.description || 'No description';
        desc.textContent = fullDesc.length > 80 ? fullDesc.substring(0, 80) + '...' : fullDesc;

        div.appendChild(title);
        div.appendChild(desc);

        div.onclick = function(e) {
            e.stopPropagation();
            selectRecipe(recipe.id);
            return false;
        };

        fragment.appendChild(div);
    });

    recipeSelectList.appendChild(fragment);

    if (filtered.length > 30) {
        const info = document.createElement('div');
        info.style.cssText = 'text-align: center; padding: 15px; color: #999; font-size: 14px;';
        info.textContent = `Showing 30 of ${filtered.length} recipes. Search to narrow down.`;
        recipeSelectList.appendChild(info);
    }
}

// Open recipe selector modal
function openRecipeSelector(day, meal) {
    console.log('Opening recipe selector for:', day, meal);
    currentDay = day;
    currentMeal = meal;

    const modal = document.getElementById('recipeSelectorModal');
    const searchInput = document.getElementById('recipeSearchInput');

    if (!modal) {
        console.error('Modal not found');
        return;
    }

    // Setup search
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = function(e) {
            renderRecipeList(e.target.value);
        };
    }

    renderRecipeList('');
    modal.classList.add('active');

    // Focus search
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, 100);
}

// Close recipe selector modal
function closeRecipeSelector() {
    const modal = document.getElementById('recipeSelectorModal');
    modal.classList.remove('active');
    currentDay = '';
    currentMeal = '';
}

// Select recipe for meal slot
function selectRecipe(recipeId) {
    console.log('Selecting recipe:', recipeId, 'for', currentDay, currentMeal);

    if (!currentDay || !currentMeal) {
        console.error('No day or meal selected');
        alert('Error: No meal slot selected');
        return;
    }

    const mealPlan = getMealPlan();

    if (!mealPlan[currentDay]) {
        mealPlan[currentDay] = {};
    }

    mealPlan[currentDay][currentMeal] = recipeId;

    if (saveMealPlan(mealPlan)) {
        console.log('Recipe added successfully');
        closeRecipeSelector();
        displayMealPlan();
    } else {
        alert('Failed to add recipe to meal plan');
    }
}

// Remove meal from plan
function removeMeal(day, meal) {
    const mealPlan = getMealPlan();

    if (mealPlan[day] && mealPlan[day][meal]) {
        delete mealPlan[day][meal];

        if (Object.keys(mealPlan[day]).length === 0) {
            delete mealPlan[day];
        }

        if (saveMealPlan(mealPlan)) {
            displayMealPlan();
        } else {
            alert('Failed to remove meal');
        }
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('recipeSelectorModal');
    if (e.target === modal) {
        closeRecipeSelector();
    }
});

// AI Suggestions Modal Functions
function openAISuggestionsModal() {
    const modal = document.getElementById('aiSuggestionsModal');
    const content = document.getElementById('aiSuggestionsContent');

    content.innerHTML = `
        <p style="color: #666; margin-bottom: 20px;">Get balanced weekly meal suggestions based on your saved recipes</p>
        <button class="btn-primary" onclick="generateAISuggestions()">Generate Suggestions</button>
    `;

    modal.classList.add('active');
}

function closeAISuggestionsModal() {
    const modal = document.getElementById('aiSuggestionsModal');
    modal.classList.remove('active');
}

function generateAISuggestions() {
    const recipes = getRecipes();
    const content = document.getElementById('aiSuggestionsContent');

    if (recipes.length === 0) {
        content.innerHTML = `
            <p style="color: #999; margin-bottom: 20px;">You need recipes before generating suggestions!</p>
            <a href="index-import.html" class="btn-primary">Add Recipes</a>
        `;
        return;
    }

    content.innerHTML = `
        <div style="padding: 40px;">
            <div style="margin-bottom: 20px;">
                <div style="width: 48px; height: 48px; border: 4px solid var(--color-sage); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <p style="color: #666;">Generating balanced meal plan...</p>
        </div>
    `;

    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
        const suggestions = generateMockSuggestions(recipes);
        displaySuggestions(suggestions);
    }, 2000);
}

function generateMockSuggestions(recipes) {
    // Simple algorithm to create balanced suggestions
    const suggestions = {};
    const recipePool = [...recipes];

    DAYS.forEach(day => {
        suggestions[day] = {};
        MEALS.forEach(meal => {
            if (recipePool.length > 0) {
                const randomIndex = Math.floor(Math.random() * recipePool.length);
                suggestions[day][meal] = recipePool[randomIndex].id;
                recipePool.splice(randomIndex, 1);

                // Refill pool if empty
                if (recipePool.length === 0 && recipes.length > 0) {
                    recipePool.push(...recipes);
                }
            }
        });
    });

    return suggestions;
}

function displaySuggestions(suggestions) {
    const content = document.getElementById('aiSuggestionsContent');
    currentSuggestions = suggestions;

    let html = '<div style="text-align: left;">';
    html += '<h3 style="font-family: var(--font-serif); margin-bottom: 20px; text-align: center;">Suggested Meal Plan</h3>';

    DAYS.forEach(day => {
        html += `<div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px;">`;
        html += `<h4 style="margin-bottom: 10px; font-weight: 600;">${day}</h4>`;

        MEALS.forEach(meal => {
            const recipeId = suggestions[day][meal];
            const recipe = getRecipeById(recipeId);
            if (recipe) {
                html += `<div style="font-size: 14px; color: #666; margin-left: 10px;">`;
                html += `<strong>${meal}:</strong> ${recipe.title}`;
                html += `</div>`;
            }
        });

        html += `</div>`;
    });

    html += `
        <div style="text-align: center; margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
            <button class="btn-secondary" onclick="generateAISuggestions()">Regenerate</button>
            <button class="btn-primary" onclick="applySuggestions()">Apply to Meal Plan</button>
        </div>
    `;
    html += '</div>';

    content.innerHTML = html;
}

function applySuggestions() {
    if (!currentSuggestions) {
        alert('No suggestions available');
        return;
    }

    if (saveMealPlan(currentSuggestions)) {
        closeAISuggestionsModal();
        displayMealPlan();
        currentSuggestions = null;
    } else {
        alert('Failed to apply suggestions');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayMealPlan();

    // Add CSS animation for spinner
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});
