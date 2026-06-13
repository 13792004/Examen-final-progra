import * as Notifications from "expo-notifications";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Tipos
type Tarea = {
  id: number;
  titulo: string;
  descripcion: string;
  completada: number;
};

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Crear tabla al iniciar
  useEffect(() => {
    crearTabla();
    cargarTareas();
    pedirPermisos();
  }, []);

  // Pedir permisos de notificaciones
  const pedirPermisos = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos", "Se necesitan permisos para notificaciones");
    }
  };

  // Crear tabla SQLite
  const crearTabla = async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        completada INTEGER DEFAULT 0
      );
    `);
  };

  // READ - Cargar tareas
  const cargarTareas = async () => {
    const resultado = await db.getAllAsync<Tarea>(
      "SELECT * FROM tareas ORDER BY id DESC;",
    );
    setTareas(resultado);
  };

  // Enviar notificación
  const enviarNotificacion = async (mensaje: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 TareasApp",
        body: mensaje,
        sound: true,
      },
      trigger: null, // instantánea
    });
  };

  // CREATE o UPDATE
  const guardarTarea = async () => {
    if (!titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    if (editandoId !== null) {
      // UPDATE
      await db.runAsync(
        "UPDATE tareas SET titulo = ?, descripcion = ? WHERE id = ?;",
        [titulo, descripcion, editandoId],
      );
      await enviarNotificacion(`Tarea actualizada: ${titulo}`);
      setEditandoId(null);
    } else {
      // CREATE
      await db.runAsync(
        "INSERT INTO tareas (titulo, descripcion) VALUES (?, ?);",
        [titulo, descripcion],
      );
      await enviarNotificacion(`Nueva tarea registrada: ${titulo}`);
    }

    setTitulo("");
    setDescripcion("");
    cargarTareas();
  };

  // Editar tarea
  const editarTarea = (tarea: Tarea) => {
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion);
    setEditandoId(tarea.id);
  };

  // DELETE
  const eliminarTarea = (id: number) => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await db.runAsync("DELETE FROM tareas WHERE id = ?;", [id]);
          cargarTareas();
        },
      },
    ]);
  };

  // Marcar como completada
  const toggleCompletada = async (tarea: Tarea) => {
    const nuevoEstado = tarea.completada === 0 ? 1 : 0;
    await db.runAsync("UPDATE tareas SET completada = ? WHERE id = ?;", [
      nuevoEstado,
      tarea.id,
    ]);
    cargarTareas();
  };

  // Render de cada tarea
  const renderTarea = ({ item }: { item: Tarea }) => (
    <View style={styles.tarjetaTarea}>
      <TouchableOpacity
        onPress={() => toggleCompletada(item)}
        style={styles.filaTitulo}
      >
        <Text
          style={[
            styles.textoTitulo,
            item.completada === 1 && styles.textoTachado,
          ]}
        >
          {item.completada === 1 ? "✅" : "⬜"} {item.titulo}
        </Text>
      </TouchableOpacity>
      {item.descripcion ? (
        <Text style={styles.textoDescripcion}>{item.descripcion}</Text>
      ) : null}
      <View style={styles.filaBotones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => editarTarea(item)}
        >
          <Text style={styles.textoBtnEditar}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => eliminarTarea(item.id)}
        >
          <Text style={styles.textoBtnEliminar}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>📋 Mis Tareas</Text>

      {/* Formulario */}
      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="Título de la tarea *"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <TouchableOpacity style={styles.btnGuardar} onPress={guardarTarea}>
          <Text style={styles.textoBtnGuardar}>
            {editandoId !== null ? "💾 Actualizar Tarea" : "➕ Agregar Tarea"}
          </Text>
        </TouchableOpacity>
        {editandoId !== null && (
          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => {
              setEditandoId(null);
              setTitulo("");
              setDescripcion("");
            }}
          >
            <Text style={styles.textoBtnCancelar}>✖ Cancelar edición</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de tareas */}
      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTarea}
        ListEmptyComponent={
          <Text style={styles.textoVacio}>No hay tareas aún. ¡Agrega una!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F0F4FF",
    padding: 16,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 16,
    textAlign: "center",
  },
  formulario: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  btnGuardar: {
    backgroundColor: "#208AEF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  textoBtnGuardar: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  btnCancelar: { marginTop: 8, alignItems: "center" },
  textoBtnCancelar: { color: "#999", fontSize: 13 },
  tarjetaTarea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  filaTitulo: { marginBottom: 4 },
  textoTitulo: { fontSize: 16, fontWeight: "bold", color: "#1a1a2e" },
  textoTachado: { textDecorationLine: "line-through", color: "#aaa" },
  textoDescripcion: { fontSize: 13, color: "#555", marginBottom: 8 },
  filaBotones: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  btnEditar: {
    backgroundColor: "#FFF3CD",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  textoBtnEditar: { color: "#856404", fontSize: 13 },
  btnEliminar: {
    backgroundColor: "#FFE0E0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  textoBtnEliminar: { color: "#c0392b", fontSize: 13 },
  textoVacio: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 40,
    fontSize: 15,
  },
});
