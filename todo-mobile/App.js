import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';

const BACKEND_URL = 'https://todo-app-2soz.onrender.com'; // ✅ Replace with your real backend URL

fetch(`${BACKEND_URL}/todos`)
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error fetching todos:", error));
  
export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await fetch(`${BACKEND_URL}/todos/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      fetchTodos();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/todos/${id}`, { method: 'DELETE' });
      fetchTodos();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Checkbox
              value={item.completed}
              onValueChange={() => toggleComplete(item.id, item.completed)}
            />
            <Text style={[styles.todoText, item.completed && styles.completedText]}>{item.task}</Text>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.delete}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  todoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  todoText: { marginLeft: 10, flex: 1, fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: 'gray' },
  delete: { fontSize: 18, marginLeft: 10 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});


