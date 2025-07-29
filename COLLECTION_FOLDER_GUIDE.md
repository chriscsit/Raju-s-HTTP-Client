# 🗂️ Postman Collection Folder Structure Guide

## ✨ New Features

Your **Raju's API Client** now properly maintains Postman's folder structure when importing collections!

### 🎯 What's New
- **Hierarchical folder display** with expand/collapse functionality
- **Visual folder icons** and chevron indicators  
- **Proper nesting** of requests within folders
- **Search through folders** - finds requests in nested folders
- **Export maintains structure** - folders are preserved when exporting

---

## 📁 Folder Structure Features

### **Visual Indicators**
- 📁 **Folder icon** - Blue folder icons for folders
- ▶️ **Chevron right** - Collapsed folder
- ▼ **Chevron down** - Expanded folder
- 🔢 **Item count** - Shows number of items in folder `(3 items)`

### **Interaction**
- **Click folder name** - Expand/collapse folder
- **Click request** - Load request into main panel
- **Hover actions** - Delete buttons appear on hover
- **Nested indentation** - Visual hierarchy with proper spacing

---

## 🧪 Testing the Folder Structure

### **Option 1: Use Sample Collection**
1. **Open**: [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001)
2. **Sidebar**: Click hamburger menu → Collections tab
3. **Import**: Click Import button
4. **Select**: `sample-postman-collection.json` from project root
5. **Expected Result**:
   ```
   📁 API Folder (2 items) ▶️
   📋 Get Users
   📋 Create User
   ```

### **Option 2: Test Your Postman Collection**
1. **Export from Postman**: Collection → Export → v2.1
2. **Import in Raju's Client**: Use Import button
3. **Verify**: Folders should appear with expand/collapse functionality

---

## 🎛️ Folder Operations

### **Expand/Collapse Folders**
- **Click folder name** to toggle
- **Folders start collapsed** by default
- **State persists** during session

### **Navigate Nested Structure**
```
📁 API Tests (5 items) ▼
   📁 Authentication (2 items) ▶️
   📁 User Management (3 items) ▼
      📋 Get User Profile
      📋 Update User
      📋 Delete User
```

### **Search Through Folders**
- **Search box** finds requests in any folder
- **Shows matching folders** and their contents
- **Highlights relevant items**

---

## 🔄 Import/Export Behavior

### **Import Process**
1. **Detects folder structure** in Postman collections
2. **Preserves hierarchy** - maintains nested organization
3. **Shows accurate count** - counts all nested requests
4. **Success message**: "Successfully imported X requests"

### **Export Process**
1. **Maintains folder structure** when exporting
2. **Postman-compatible format** - can be imported back to Postman
3. **Nested folders preserved** - exact hierarchy maintained

---

## 📊 Collection Data Structure

### **Before (Flat Structure)**
```json
[
  { "name": "API Folder/Get Users", "request": {...} },
  { "name": "API Folder/Create User", "request": {...} }
]
```

### **After (Hierarchical Structure)**
```json
[
  {
    "type": "folder",
    "name": "API Folder",
    "isExpanded": false,
    "items": [
      { "type": "request", "name": "Get Users", "request": {...} },
      { "type": "request", "name": "Create User", "request": {...} }
    ]
  }
]
```

---

## 🎨 UI Improvements

### **Visual Hierarchy**
- **Indentation**: Each level indented 16px
- **Icons**: Folders get 📁 icon, requests get method badges
- **Colors**: Folders use blue theme, requests use method colors

### **Interactive Elements**
- **Hover effects**: Smooth transitions on hover
- **Click areas**: Clear distinction between folder toggle and delete
- **Visual feedback**: Immediate expand/collapse animation

---

## 🔧 Supported Collection Formats

✅ **Postman Collection v2.1** (with folders)  
✅ **Postman Collection v2.0** (with folders)  
✅ **Nested folder structures** (unlimited depth)  
✅ **Mixed content** (folders + individual requests)  
✅ **Empty folders** (preserved in structure)  

---

## 🐛 Troubleshooting

### **Folders Not Expanding?**
- Check browser console for errors
- Ensure collection has proper folder structure
- Try refreshing the page

### **Import Not Working?**
- Verify file is valid JSON
- Check if collection has `item` array with nested `item` arrays for folders
- Look for console logs showing import process

### **Missing Requests?**
- Expand all folders to see nested requests
- Use search to find specific requests
- Check import success message for total count

---

## 🎉 Perfect Folder Organization!

Your collections now maintain their **professional folder structure** just like in Postman!

**Ready to test? Import your Postman collection and see the beautiful folder hierarchy! 📁✨** 