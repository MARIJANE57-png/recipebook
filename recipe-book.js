// Recipe Book JavaScript - ShopMy Style Horizontal Cards

let allRecipes = [];
let filteredRecipes = [];

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
        
        // Check if data is too large
        if (recipesData && recipesData.length > 5000000) { // 5MB
            console.warn('Recipe data is too large, clearing...');
            localStorage.removeItem('recipes');
            alert('Your recipe data was too large and has been cleared. Please re-import your recipes without large images.');
            allRecipes = [];
            filteredRecipes = [];
            displayRecipes([]);
            updateRecipeCount(0);
            return;
        }
        
        const recipes = JSON.parse(recipesData || '[]');
        
        // Remove base64 images that are too large to prevent crashes
        const cleanedRecipes = recipes.map(recipe => {
            if (recipe.thumbnailUrl && recipe.thumbnailUrl.startsWith('data:image') && recipe.thumbnailUrl.length > 100000) {
                // Image is too large, remove it
                return { ...recipe, thumbnailUrl: '' };
            }
            return recipe;
        });
        
        allRecipes = cleanedRecipes;
        filteredRecipes = cleanedRecipes;
        displayRecipes(cleanedRecipes);
        updateRecipeCount(cleanedRecipes.length);
        
        // Save cleaned recipes back
        if (JSON.stringify(cleanedRecipes) !== recipesData) {
            localStorage.setItem('recipes', JSON.stringify(cleanedRecipes));
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        // If there's an error, clear and start fresh
        localStorage.removeItem('recipes');
        allRecipes = [];
        filteredRecipes = [];
        displayRecipes([]);
        updateRecipeCount(0);
        alert('There was an error loading your recipes. The data has been cleared.');
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
    
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card-horizontal" onclick="openRecipeModal(${recipes.indexOf(recipe)})">
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
                    <button class="favorite-btn ${recipe.favorite ? 'active' : ''}" onclick="toggleFavorite(event, ${recipes.indexOf(recipe)})">
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
    allRecipes[index].favorite = !allRecipes[index].favorite;
    localStorage.setItem('recipes', JSON.stringify(allRecipes));
    displayRecipes(filteredRecipes);
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
        localStorage.setItem('recipes', JSON.stringify(allRecipes));
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
