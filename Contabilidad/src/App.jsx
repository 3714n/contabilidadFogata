
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { CalendarPlus as CalendarIcon, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon, Pencil as PencilIcon, Trash2 as TrashIcon } from 'lucide-react'

export default function App() {
  const { toast } = useToast()
  const [fecha, setFecha] = useState(new Date())
  const [cajaInicial, setCajaInicial] = useState(0)
  const [ingresos, setIngresos] = useState(0)
  const [gastos, setGastos] = useState(0)
  const [efectivo, setEfectivo] = useState(0)
  const [banco, setBanco] = useState(0)
  const [utilidad, setUtilidad] = useState(0)
  const [diferencia, setDiferencia] = useState(0)
  const [registros, setRegistros] = useState([])
  const [registroExpandido, setRegistroExpandido] = useState(null)
  const [registroAEditar, setRegistroAEditar] = useState(null)
  const [registroAEliminar, setRegistroAEliminar] = useState(null)
  const [editando, setEditando] = useState({
    cajaInicial: 0,
    ingresos: 0,
    gastos: 0,
    efectivo: 0,
    banco: 0
  })

  useEffect(() => {
    const registrosGuardados = localStorage.getItem('registros_contables')
    if (registrosGuardados) {
      setRegistros(JSON.parse(registrosGuardados))
    }
  }, [])

  useEffect(() => {
    const calcularUtilidad = () => {
      const utilidadCalculada = (Number(cajaInicial) + Number(ingresos)) - Number(gastos)
      setUtilidad(utilidadCalculada)
      
      const totalDisponible = Number(efectivo) + Number(banco)
      setDiferencia(utilidadCalculada - totalDisponible)
    }
    
    calcularUtilidad()
  }, [cajaInicial, ingresos, gastos, efectivo, banco])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const nuevoRegistro = {
      fecha: fecha.toISOString(),
      cajaInicial: Number(cajaInicial),
      ingresos: Number(ingresos),
      gastos: Number(gastos),
      efectivo: Number(efectivo),
      banco: Number(banco),
      utilidad: Number(utilidad),
      diferencia: Number(diferencia)
    }

    const nuevosRegistros = [...registros, nuevoRegistro]
    setRegistros(nuevosRegistros)
    localStorage.setItem('registros_contables', JSON.stringify(nuevosRegistros))
    
    if (diferencia === 0) {
      toast({
        title: "¡Éxito!",
        description: "Los valores cuadran correctamente y han sido guardados",
      })
    } else {
      toast({
        title: "¡Atención!",
        description: `Hay una diferencia de ${diferencia.toFixed(2)}`,
        variant: "destructive",
      })
    }
  }

  const toggleRegistro = (index) => {
    if (registroExpandido === index) {
      setRegistroExpandido(null)
    } else {
      setRegistroExpandido(index)
    }
  }

  const iniciarEdicion = (registro, index) => {
    setRegistroAEditar(index)
    setEditando({
      cajaInicial: registro.cajaInicial,
      ingresos: registro.ingresos,
      gastos: registro.gastos,
      efectivo: registro.efectivo,
      banco: registro.banco
    })
  }

  const guardarEdicion = () => {
    const registrosActualizados = [...registros]
    const utilidadCalculada = (Number(editando.cajaInicial) + Number(editando.ingresos)) - Number(editando.gastos)
    const totalDisponible = Number(editando.efectivo) + Number(editando.banco)
    const diferenciaCalculada = utilidadCalculada - totalDisponible

    registrosActualizados[registroAEditar] = {
      ...registrosActualizados[registroAEditar],
      ...editando,
      utilidad: utilidadCalculada,
      diferencia: diferenciaCalculada
    }

    setRegistros(registrosActualizados)
    localStorage.setItem('registros_contables', JSON.stringify(registrosActualizados))
    setRegistroAEditar(null)
    
    toast({
      title: "¡Éxito!",
      description: "El registro ha sido actualizado correctamente",
    })
  }

  const eliminarRegistro = () => {
    const registrosActualizados = registros.filter((_, index) => index !== registroAEliminar)
    setRegistros(registrosActualizados)
    localStorage.setItem('registros_contables', JSON.stringify(registrosActualizados))
    setRegistroAEliminar(null)
    
    toast({
      title: "Registro eliminado",
      description: "El registro ha sido eliminado correctamente",
    })
  }

  const renderFormulario = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Fecha</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(fecha, "PPP", { locale: es })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={setFecha}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cajaInicial">Caja Inicial</Label>
          <Input
            id="cajaInicial"
            type="number"
            step="0.01"
            value={cajaInicial}
            onChange={(e) => setCajaInicial(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ingresos">Ingresos</Label>
          <Input
            id="ingresos"
            type="number"
            step="0.01"
            value={ingresos}
            onChange={(e) => setIngresos(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gastos">Gastos</Label>
          <Input
            id="gastos"
            type="number"
            step="0.01"
            value={gastos}
            onChange={(e) => setGastos(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="utilidad">Utilidad del Día</Label>
          <Input
            id="utilidad"
            type="number"
            value={utilidad.toFixed(2)}
            readOnly
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="efectivo">Efectivo en Caja</Label>
          <Input
            id="efectivo"
            type="number"
            step="0.01"
            value={efectivo}
            onChange={(e) => setEfectivo(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banco">Banco</Label>
          <Input
            id="banco"
            type="number"
            step="0.01"
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <div className={`text-center text-lg font-semibold ${diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diferencia === 0 
            ? "¡Los valores cuadran correctamente!" 
            : `Diferencia: ${diferencia.toFixed(2)}`}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Guardar Registro
      </Button>
    </form>
  )

  const renderRegistros = () => (
    <div className="space-y-4">
      <AnimatePresence>
        {registros.slice().reverse().map((registro, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div 
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => toggleRegistro(index)}
              >
                {registroExpandido === index ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {format(new Date(registro.fecha), "PPP", { locale: es })}
                </span>
                <span className={registro.diferencia === 0 ? 'text-green-600' : 'text-red-600'}>
                  Utilidad: {registro.utilidad.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => iniciarEdicion(registro, registros.length - 1 - index)}
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setRegistroAEliminar(registros.length - 1 - index)}
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>

            {registroExpandido === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-2 gap-4 text-sm border-t pt-4"
              >
                <div>
                  <span className="font-medium">Caja Inicial:</span>
                  <span className="ml-2">{registro.cajaInicial.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Ingresos:</span>
                  <span className="ml-2">{registro.ingresos.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Gastos:</span>
                  <span className="ml-2">{registro.gastos.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Efectivo:</span>
                  <span className="ml-2">{registro.efectivo.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Banco:</span>
                  <span className="ml-2">{registro.banco.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Diferencia:</span>
                  <span className={`ml-2 ${registro.diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {registro.diferencia.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-blue-800">
              Control de Caja Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="registro" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="registro">Nuevo Registro</TabsTrigger>
                <TabsTrigger value="historial">Historial</TabsTrigger>
              </TabsList>
              <TabsContent value="registro" className="mt-6">
                {renderFormulario()}
              </TabsContent>
              <TabsContent value="historial" className="mt-6">
                {renderRegistros()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={registroAEditar !== null} onOpenChange={() => setRegistroAEditar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cajaInicial">Caja Inicial</Label>
              <Input
                id="edit-cajaInicial"
                type="number"
                step="0.01"
                value={editando.cajaInicial}
                onChange={(e) => setEditando({ ...editando, cajaInicial: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ingresos">Ingresos</Label>
              <Input
                id="edit-ingresos"
                type="number"
                step="0.01"
                value={editando.ingresos}
                onChange={(e) => setEditando({ ...editando, ingresos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gastos">Gastos</Label>
              <Input
                id="edit-gastos"
                type="number"
                step="0.01"
                value={editando.gastos}
                onChange={(e) => setEditando({ ...editando, gastos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-efectivo">Efectivo</Label>
              <Input
                id="edit-efectivo"
                type="number"
                step="0.01"
                value={editando.efectivo}
                onChange={(e) => setEditando({ ...editando, efectivo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-banco">Banco</Label>
              <Input
                id="edit-banco"
                type="number"
                step="0.01"
                value={editando.banco}
                onChange={(e) => setEditando({ ...editando, banco: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistroAEditar(null)}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={registroAEliminar !== null} onOpenChange={() => setRegistroAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminarRegistro} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
