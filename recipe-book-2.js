// Recipe Book JavaScript - ShopMy Style Horizontal Cards

let allRecipes = [];
let filteredRecipes = [];
let currentHealthierRecipe = null;
let currentOriginalIndex = null;

// Safe save function to prevent storage overflow
function safelySaveRecipes(recipes) {
    // Remove any image data
    const cleanedRecipes = recipes.map(recipe => {
        const { thumbnailUrl, image, ...clean } = recipe;
        return clean;
    });

    const dataString = JSON.stringify(cleanedRecipes);
    if (dataString.length > 4000000) {
        alert('Storage full! Delete some recipes first.');
        return false;
    }

    try {
        localStorage.setItem('recipes', dataString);
        return true;
    } catch (error) {
        console.error('Error saving recipes:', error);
        alert('Failed to save. Storage may be full.');
        return false;
    }
}

// Load recipes on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    setupSearch();
    setupFilters();
    setupModalCloseHandlers();
});
function loadRecipes() {
    try {
        const recipesData = localStorage.getItem('recipes');
        
        // Safety check - if data seems corrupted or too large, start fresh
        if (!recipesData) {
            allRecipes = [];
            filteredRecipes = [];
            displayRecipes([]);
            updateRecipeCount(0);
            return;
        }
        
        // Check data size (if over 4MB, probably has images - clear it)
        if (recipesData.length > 4000000) {
            console.warn('Recipe data too large - clearing for safety');
            localStorage.removeItem('recipes');
            alert('Recipe data was too large. Starting fresh! Please re-add your recipes.');
            allRecipes = [];
            filteredRecipes = [];
            displayRecipes([]);
            updateRecipeCount(0);
            return;
        }
        
        const recipes = JSON.parse(recipesData);
        
        // Remove any thumbnailUrl fields that might exist
        const cleanedRecipes = recipes.map(recipe => {
            const { thumbnailUrl, ...recipeWithoutImage } = recipe;
            return recipeWithoutImage;
        });
        
        allRecipes = cleanedRecipes;
        filteredRecipes = cleanedRecipes;
        displayRecipes(cleanedRecipes);
        updateRecipeCount(cleanedRecipes.length);
        
        // Save cleaned version back
        localStorage.setItem('recipes', JSON.stringify(cleanedRecipes));
        
    } catch (error) {
        console.error('Error loading recipes:', error);
        // If there's ANY error, clear and start fresh
        localStorage.removeItem('recipes');
        allRecipes = [];
        filteredRecipes = [];
        displayRecipes([]);
        updateRecipeCount(0);
    }
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipeGrid');

    if (recipes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--color-warm-gray);">
                <p style="font-size: 18px; margin-bottom: 12px;">No recipes yet!</p>
                <p style="font-size: 14px;">Import your first recipe to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recipes.map((recipe, index) => `
        <div class="recipe-card-horizontal" onclick="openRecipeModal(${index})">
            <div class="recipe-card-image recipe-card-badge">
                <div class="creator-badge">
                    <span class="badge-text">Recipe<br>Society</span>
                </div>
            </div>
            <div class="recipe-card-content">
                <h3 class="recipe-card-title">${recipe.title || 'Untitled Recipe'}</h3>

                ${recipe.description ? `
                    <p class="recipe-card-description">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>
                ` : ''}

                <div class="recipe-card-meta">
                    ${recipe.prepTime ? `<span>⏱️ ${recipe.prepTime}</span>` : ''}
                    ${recipe.servings ? `<span>🍽️ ${recipe.servings} servings</span>` : ''}
                </div>

                <div class="recipe-card-footer">
                    <span class="recipe-source-badge">${recipe.source || 'Recipe'}</span>
                    <button class="favorite-btn ${recipe.favorite ? 'active' : ''}" onclick="toggleFavorite(event, ${index})">
                        ${recipe.favorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateRecipeCount(count) {
    const countEl = document.getElementById('totalCount');
    if (countEl) {
        countEl.textContent = count;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filteredRecipes = allRecipes.filter(recipe => {
                return (recipe.title?.toLowerCase().includes(query)) ||
                       (recipe.ingredients?.some(ing => ing.toLowerCase().includes(query))) ||
                       (recipe.tags?.some(tag => tag.toLowerCase().includes(query)));
            });
            displayRecipes(filteredRecipes);
            updateRecipeCount(filteredRecipes.length);
        });
    }
}

function setupFilters() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const filterDropdown = document.getElementById('filterDropdown');
    const sourceFilter = document.getElementById('sourceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const clearFilters = document.getElementById('clearFilters');
    
    if (hamburgerMenu && filterDropdown) {
        // Toggle dropdown when hamburger is clicked
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && e.target !== hamburgerMenu) {
                filterDropdown.classList.add('hidden');
            }
        });
        
        // Prevent dropdown from closing when clicking inside it
        filterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Source filter
    if (sourceFilter) {
        sourceFilter.addEventListener('change', (e) => {
            filterBySource(e.target.value);
        });
    }
    
    // Sort filter
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            sortRecipes(e.target.value);
        });
    }
    
    // Clear filters button
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            sourceFilter.value = 'all';
            sortFilter.value = 'newest';
            filteredRecipes = allRecipes;
            displayRecipes(filteredRecipes);
            updateRecipeCount(filteredRecipes.length);
            filterDropdown.classList.add('hidden');
        });
    }
}

function filterBySource(source) {
    if (source === 'all') {
        filteredRecipes = allRecipes;
    } else {
        filteredRecipes = allRecipes.filter(recipe => recipe.source === source);
    }
    displayRecipes(filteredRecipes);
    updateRecipeCount(filteredRecipes.length);
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) {
        filterDropdown.classList.add('hidden');
    }
}

function filterByFavorites() {
    filteredRecipes = allRecipes.filter(recipe => recipe.favorite);
    displayRecipes(filteredRecipes);
    updateRecipeCount(filteredRecipes.length);
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) {
        filterDropdown.classList.add('hidden');
    }
}

function sortRecipes(sortType) {
    switch(sortType) {
        case 'newest':
            filteredRecipes.sort((a, b) => (b.id || 0) - (a.id || 0));
            break;
        case 'oldest':
            filteredRecipes.sort((a, b) => (a.id || 0) - (b.id || 0));
            break;
        case 'name-asc':
            filteredRecipes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
        case 'name-desc':
            filteredRecipes.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
            break;
    }
    displayRecipes(filteredRecipes);
}

function toggleFavorite(event, index) {
    event.stopPropagation();
    const recipe = filteredRecipes[index];
    const globalIndex = allRecipes.findIndex(r => r.id === recipe.id);
    if (globalIndex !== -1) {
        allRecipes[globalIndex].favorite = !allRecipes[globalIndex].favorite;
        recipe.favorite = allRecipes[globalIndex].favorite;
        safelySaveRecipes(allRecipes);
        displayRecipes(filteredRecipes);
    }
}

function openRecipeModal(index) {
    const recipe = filteredRecipes[index];
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalRecipeContent');
    
    modalContent.innerHTML = `
        <div class="modal-recipe-header">
            ${recipe.thumbnailUrl ? `
                <img src="${recipe.thumbnailUrl}" alt="${recipe.title}" class="modal-recipe-image">
            ` : ''}
            <h2 class="modal-recipe-title">${recipe.title}</h2>
            ${recipe.description ? `<p class="modal-recipe-description">${recipe.description}</p>` : ''}
            
            <div class="modal-recipe-meta">
                ${recipe.prepTime ? `<span>⏱️ Prep: ${recipe.prepTime}</span>` : ''}
                ${recipe.cookTime ? `<span>🔥 Cook: ${recipe.cookTime}</span>` : ''}
                ${recipe.servings ? `<span>🍽️ Servings: ${recipe.servings}</span>` : ''}
            </div>
            
            <span class="recipe-source-badge">${recipe.source || 'Recipe'}</span>
        </div>
        
        <div class="modal-recipe-body">
            <div class="modal-section">
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients?.map(ing => `<li>${ing}</li>`).join('') || '<li>No ingredients listed</li>'}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Instructions</h3>
                <ol class="instructions-list">
                    ${recipe.instructions?.map(step => `<li>${step}</li>`).join('') || '<li>No instructions provided</li>'}
                </ol>
            </div>
            
            ${recipe.notes ? `
                <div class="modal-section">
                    <h3>Notes</h3>
                    <p>${recipe.notes}</p>
                </div>
            ` : ''}
        </div>
        
        <div class="modal-recipe-footer">
            ${recipe.sourceUrl ? `<a href="${recipe.sourceUrl}" target="_blank" class="source-link">View Original</a>` : ''}
            <button onclick="cleanItUp(${index})" class="btn-secondary" style="background: var(--color-sage); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 10px;">🥗 Clean It Up</button>
            <button onclick="deleteRecipe(${index})" class="delete-btn">Delete Recipe</button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function deleteRecipe(index) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        const recipeToDelete = filteredRecipes[index];
        const globalIndex = allRecipes.findIndex(r => r.id === recipeToDelete.id);
        allRecipes.splice(globalIndex, 1);
        filteredRecipes = allRecipes;
        safelySaveRecipes(allRecipes);
        closeModal();
        displayRecipes(allRecipes);
        updateRecipeCount(allRecipes.length);
    }
}

// Setup modal close handlers
function setupModalCloseHandlers() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        // Click on backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                closeModal();
            }
        });
    }

    // Close button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });
}

// Clean It Up - Make recipe healthier
function cleanItUp(index) {
    const recipe = filteredRecipes[index];

    if (!confirm('Create a healthier version of this recipe with smart ingredient swaps?')) {
        return;
    }

    // Show loading state
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalRecipeContent');

    modalContent.innerHTML = `
        <div style="text-align: center; padding: 60px;">
            <div style="width: 48px; height: 48px; border: 4px solid var(--color-sage); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #666;">Creating healthier version...</p>
        </div>
    `;

    // Simulate AI processing (replace with actual API call)
    setTimeout(() => {
        const healthierRecipe = generateHealthierVersion(recipe);
        displayHealthierVersion(recipe, healthierRecipe, index);
    }, 2000);
}

function generateHealthierVersion(recipe) {
    // Mock healthier version with common swaps
    const healthierRecipe = {
        ...recipe,
        id: Date.now().toString(),
        title: recipe.title + ' (Healthy Version)',
        description: 'Healthier version with smart ingredient swaps',
        ingredients: recipe.ingredients?.map(ing => {
            let healthyIng = ing;

            // Common swaps
            if (ing.toLowerCase().includes('pasta')) {
                healthyIng = ing.replace(/pasta/gi, 'zucchini noodles');
            } else if (ing.toLowerCase().includes('rice')) {
                healthyIng = ing.replace(/rice/gi, 'cauliflower rice');
            } else if (ing.toLowerCase().includes('burger bun')) {
                healthyIng = ing.replace(/burger bun/gi, 'lettuce wrap');
            } else if (ing.toLowerCase().includes('fried')) {
                healthyIng = ing.replace(/fried/gi, 'baked');
            } else if (ing.toLowerCase().includes('butter')) {
                healthyIng = ing.replace(/butter/gi, 'olive oil');
            } else if (ing.toLowerCase().includes('sugar')) {
                healthyIng = ing.replace(/sugar/gi, 'honey (reduced amount)');
            }

            return healthyIng;
        }) || [],
        instructions: recipe.instructions?.map(step => {
            let healthyStep = step;

            if (step.toLowerCase().includes('fry')) {
                healthyStep = step.replace(/fry/gi, 'bake or grill');
            }

            return healthyStep;
        }) || []
    };

    return healthierRecipe;
}

function displayHealthierVersion(original, healthier, originalIndex) {
    const modalContent = document.getElementById('modalRecipeContent');
    currentHealthierRecipe = healthier;
    currentOriginalIndex = originalIndex;

    modalContent.innerHTML = `
        <div class="modal-recipe-header">
            <h2 class="modal-recipe-title">Healthier Version Created! 🥗</h2>
            <p class="modal-recipe-description">Compare the original and healthier versions below</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="border: 2px solid #ddd; border-radius: 8px; padding: 20px;">
                <h3 style="color: #666; margin-bottom: 15px;">Original</h3>
                <h4 style="margin-bottom: 10px; font-size: 16px;">${original.title}</h4>
                <div style="font-size: 14px;">
                    <strong>Key Ingredients:</strong>
                    <ul style="margin-top: 5px; padding-left: 20px;">
                        ${original.ingredients?.slice(0, 5).map(ing => `<li>${ing}</li>`).join('') || ''}
                    </ul>
                </div>
            </div>

            <div style="border: 2px solid var(--color-sage); border-radius: 8px; padding: 20px; background: #f9f9f9;">
                <h3 style="color: var(--color-sage); margin-bottom: 15px;">Healthier Version ✓</h3>
                <h4 style="margin-bottom: 10px; font-size: 16px;">${healthier.title}</h4>
                <div style="font-size: 14px;">
                    <strong>Improved Ingredients:</strong>
                    <ul style="margin-top: 5px; padding-left: 20px;">
                        ${healthier.ingredients?.slice(0, 5).map(ing => `<li>${ing}</li>`).join('') || ''}
                    </ul>
                </div>
            </div>
        </div>

        <div class="modal-recipe-footer" style="justify-content: center;">
            <button onclick="saveHealthierVersion()" class="btn-primary">Save as New Recipe</button>
            <button onclick="replaceWithHealthier()" class="btn-secondary">Replace Original</button>
            <button onclick="openRecipeModal(${originalIndex})" class="btn-secondary">Cancel</button>
        </div>
    `;
}

function saveHealthierVersion() {
    if (!currentHealthierRecipe) {
        alert('No healthier version available');
        return;
    }

    allRecipes.push(currentHealthierRecipe);
    filteredRecipes = allRecipes;

    if (safelySaveRecipes(allRecipes)) {
        closeModal();
        displayRecipes(allRecipes);
        updateRecipeCount(allRecipes.length);
        currentHealthierRecipe = null;
        currentOriginalIndex = null;
    }
}

function replaceWithHealthier() {
    if (!currentHealthierRecipe || currentOriginalIndex === null) {
        alert('No healthier version available');
        return;
    }

    if (!confirm('Replace the original recipe? This cannot be undone.')) {
        return;
    }

    const recipe = filteredRecipes[currentOriginalIndex];
    const globalIndex = allRecipes.findIndex(r => r.id === recipe.id);

    // Keep original ID
    currentHealthierRecipe.id = recipe.id;
    allRecipes[globalIndex] = currentHealthierRecipe;
    filteredRecipes = allRecipes;

    if (safelySaveRecipes(allRecipes)) {
        closeModal();
        displayRecipes(allRecipes);
        currentHealthierRecipe = null;
        currentOriginalIndex = null;
    }
}
