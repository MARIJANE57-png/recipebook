// Recipe Book - Display and Manage Recipes

// Get recipes from localStorage
function getRecipes() {
    try {
        const recipesData = localStorage.getItem('recipes');

        if (!recipesData) {
            return [];
        }

        // Check data size
        if (recipesData.length > 4000000) {
            console.warn('Recipe data too large - clearing');
            localStorage.removeItem('recipes');
            alert('Recipe storage was too full. Please re-add recipes.');
            return [];
        }

        const recipes = JSON.parse(recipesData);

        // Remove any image data
        return recipes.map(recipe => {
            const { thumbnailUrl, image, ...clean } = recipe;
            return clean;
        });
    } catch (error) {
        console.error('Error loading recipes:', error);
        localStorage.removeItem('recipes');
        return [];
    }
}

// Save recipes to localStorage with size check
function saveRecipes(recipes) {
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

// Display recipes in grid
function displayRecipes() {
    const recipes = getRecipes();
    const recipeGrid = document.getElementById('recipeGrid');
    const emptyState = document.getElementById('emptyState');

    if (recipes.length === 0) {
        recipeGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.style.flexDirection = 'column';
        emptyState.style.alignItems = 'center';
        return;
    }

    recipeGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    recipeGrid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="viewRecipe('${recipe.id}')">
            <h3>${recipe.title}</h3>
            <p>${recipe.description || 'No description'}</p>
            <div class="recipe-meta">
                ${recipe.prepTime ? `<span>Prep: ${recipe.prepTime}m</span>` : ''}
                ${recipe.cookTime ? `<span>Cook: ${recipe.cookTime}m</span>` : ''}
                ${recipe.servings ? `<span>Serves: ${recipe.servings}</span>` : ''}
            </div>
            <div class="recipe-actions" onclick="event.stopPropagation()">
                <button class="btn-small" onclick="viewRecipe('${recipe.id}')">View</button>
                <button class="btn-small btn-delete" onclick="deleteRecipe('${recipe.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// View recipe details in modal
function viewRecipe(recipeId) {
    const recipes = getRecipes();
    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) {
        alert('Recipe not found');
        return;
    }

    const modal = document.getElementById('recipeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = recipe.title;

    modalBody.innerHTML = `
        ${recipe.description ? `<p style="color: #666; margin-bottom: 20px;">${recipe.description}</p>` : ''}

        <div class="recipe-meta" style="margin-bottom: 20px;">
            ${recipe.prepTime ? `<span>Prep: ${recipe.prepTime} mins</span>` : ''}
            ${recipe.cookTime ? `<span>Cook: ${recipe.cookTime} mins</span>` : ''}
            ${recipe.servings ? `<span>Servings: ${recipe.servings}</span>` : ''}
        </div>

        <div style="margin-bottom: 20px;">
            <h3 style="font-family: var(--font-serif); margin-bottom: 10px;">Ingredients</h3>
            <ul style="padding-left: 20px;">
                ${recipe.ingredients.map(ing => `<li style="margin-bottom: 8px;">${ing}</li>`).join('')}
            </ul>
        </div>

        <div>
            <h3 style="font-family: var(--font-serif); margin-bottom: 10px;">Instructions</h3>
            <ol style="padding-left: 20px;">
                ${recipe.instructions.map(inst => `<li style="margin-bottom: 12px;">${inst}</li>`).join('')}
            </ol>
        </div>
    `;

    modal.classList.add('active');
}

// Close recipe modal
function closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    modal.classList.remove('active');
}

// Delete recipe
function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }

    const recipes = getRecipes();
    const updatedRecipes = recipes.filter(r => r.id !== recipeId);

    if (saveRecipes(updatedRecipes)) {
        displayRecipes();
    } else {
        alert('Failed to delete recipe');
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('recipeModal');
    if (e.target === modal) {
        closeRecipeModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayRecipes();
});
