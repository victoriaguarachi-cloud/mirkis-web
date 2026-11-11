const productForm = document.getElementById('productForm');
const adminProductsList = document.getElementById('adminProductsList');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');

// Escuchar cambios en la colección 'products' en tiempo real
db.collection('products').onSnapshot((snapshot) => {
  adminProductsList.innerHTML = '';
  snapshot.forEach((doc) => {
    const product = doc.data();
    const id = doc.id;
    renderAdminRow(id, product);
  });
});

// Renderizar fila en la tabla
function renderAdminRow(id, product) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><img src="${product.image}" alt="${product.name}"></td>
    <td><strong>${product.name}</strong></td>
    <td>${product.category}</td>
    <td>$${Number(product.price).toLocaleString('es-AR')}</td>
    <td>
      <button class="btn-edit" onclick="editProduct('${id}', '${product.name}', '${product.category}', ${product.price}, '${product.image}')">Editar</button>
      <button class="btn-danger" onclick="deleteProduct('${id}')">Eliminar</button>
    </td>
  `;
  adminProductsList.appendChild(tr);
}

// Guardar o Actualizar Producto en Firestore
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const productData = {
    name: document.getElementById('pName').value,
    category: document.getElementById('pCategory').value,
    price: Number(document.getElementById('pPrice').value),
    image: document.getElementById('pImg').value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (id) {
      await db.collection('products').doc(id).update(productData);
      resetForm();
    } else {
      await db.collection('products').add(productData);
      resetForm();
    }
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
  }
});

// Cargar datos en el formulario para editar
function editProduct(id, name, category, price, image) {
  document.getElementById('productId').value = id;
  document.getElementById('pName').value = name;
  document.getElementById('pCategory').value = category;
  document.getElementById('pPrice').value = price;
  document.getElementById('pImg').value = image;

  formTitle.textContent = "Editar Producto";
  cancelBtn.style.display = "inline-block";
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  productForm.reset();
  document.getElementById('productId').value = '';
  formTitle.textContent = "Cargar Nuevo Producto";
  cancelBtn.style.display = "none";
}

// Eliminar Producto
async function deleteProduct(id) {
  if (confirm("¿Estás segura de eliminar este producto del catálogo?")) {
    await db.collection('products').doc(id).delete();
  }
}