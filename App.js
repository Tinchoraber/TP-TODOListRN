import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListItem, CheckBox } from 'react-native-elements';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';

const App = () => {
  const [tareas, setTareas] = useState([]);
  const [nombreTarea, setNombreTarea] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [descripcionTarea, setDescripcionTarea] = useState('');

  useEffect(() => {
    const cargarTareas = async () => {
      try {
        const tareasGuardadas = await AsyncStorage.getItem('tareas');
        if (tareasGuardadas) {
          setTareas(JSON.parse(tareasGuardadas));
        }
      } catch (error) {
        console.error(error);
      }
    };

    cargarTareas();
  }, []);

  useEffect(() => {
    const guardarTareas = async () => {
      try {
        await AsyncStorage.setItem('tareas', JSON.stringify(tareas));
      } catch (error) {
        console.error(error);
      }
    };

    guardarTareas();
  }, [tareas]);

  const agregarTarea = () => {
    if (nombreTarea.trim()) {
      const nuevaTarea = {
        id: Date.now().toString(),
        name: nombreTarea,
        description: descripcionTarea,
        completed: false,
      };
      setTareas([...tareas, nuevaTarea]);
      setNombreTarea('');
      setDescripcionTarea('');
      setIsModalVisible(false);
    } else {
      Alert.alert('Error', 'Ingrese un nombre de tarea');
    }
  };

  const tareaCompletada = (id) => {
    setTareas(tareas.map(tarea =>
      tarea.id === id ? { ...tarea, completed: !tarea.completed } : tarea
    ));
  };

  const eliminarTarea = (id) => {
    setTareas(tareas.filter(tarea => tarea.id !== id));
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => eliminarTarea(id)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <ListItem bottomDivider>
        <CheckBox
          checked={item.completed}
          onPress={() => tareaCompletada(item.id)}
        />
        <ListItem.Content>
          <ListItem.Title style={item.completed ? styles.completedTask : null}>
            {item.name}
          </ListItem.Title>
          {item.description ? <ListItem.Subtitle>{item.description}</ListItem.Subtitle> : null}
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>TODO List</Text>
      </View>
      <FlatList
        data={tareas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <View style={styles.addButtonContainer}>
        <Button
          title="Agregar Tarea"
          color="#4fc3f7"
          onPress={() => setIsModalVisible(true)}
        />
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Nombre de la tarea"
            value={nombreTarea}
            onChangeText={setNombreTarea}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción (opcional)"
            value={descripcionTarea}
            onChangeText={setDescripcionTarea}
            style={[styles.input, { height: 80 }]}
            multiline
          />
          <Button title="Agregar" onPress={agregarTarea} />
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4fc3f7',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 10,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    width: 80,
    height: '100%',
    borderRadius: 8,
    padding: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContainer: {
    padding: 10,
  },
});

export default App;
