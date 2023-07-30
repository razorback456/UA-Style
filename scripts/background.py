import time, threading

class Background:
  """
 Простий диспетчер фонових завдань, який розглядає виконання фонового завдання кожні n секунд.
Завдання виконується, лише якщо менеджера позначено як очікує на розгляд.
  """
  def __init__(self, method, sleeptime) -> None:
    """
   Створіть менеджера, який розглядатиме виклик `method` кожні `sleeptime` секундиw
    """
    self.method = method
    self.sleeptime = sleeptime
    self._pending = False
    self._started = False
    self.lock = threading.Lock()

  def start(self):
    """
    Запустіть потік менеджера
    """
    with self.lock:
      if not self._started:
        threading.Thread(group=None, target=self._action, daemon=True).start()
        self._started = True

  def set_pending(self, pending=True):
    """
   Встановити завдання як очікуване. Наступного разу, коли менеджер перевірить, він викличе `method`, а потім скасує очікування.
    """
    with self.lock:
        self._pending = pending

  def _action(self):
    while True:
      with self.lock:
        if self._pending:
            self.method()
            self._pending = False
      time.sleep(self.sleeptime) 
