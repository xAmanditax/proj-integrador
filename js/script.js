document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scheduleForm');
    const resultDiv = document.getElementById('result');
    const scheduleTableBody = document.querySelector('#scheduleTable tbody');

    
    function loadSchedules() {
        const storedSchedules = localStorage.getItem('schedules');
        if (storedSchedules) {
            return JSON.parse(storedSchedules);
        }
        return [];
    }

    
    function saveSchedules(schedules) {
        localStorage.setItem('schedules', JSON.stringify(schedules));
    }

    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

   
    let existingSchedules = loadSchedules();

   
    function updateScheduleTable() {
        scheduleTableBody.innerHTML = '';
        existingSchedules.forEach((schedule, index) => {
            const row = document.createElement('tr');
            row.dataset.index = index; 
            row.innerHTML = `
                <td>${schedule.name}</td>
                <td>${schedule.room}</td>
                <td>${formatDate(schedule.date)}</td>
                <td>${schedule.startTime}</td>
                <td>${schedule.endTime}</td>
                <td class="action-btns">
                    <button class="edit" backgroundColor="blue">Editar</button>
                    <button class="remove">Remover</button>
                </td>
            `;
            scheduleTableBody.appendChild(row);
        });

     
        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', handleEdit);
        });

        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', handleRemove);
        });
    }

    
    updateScheduleTable();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const room = document.getElementById('room').value.trim();
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

      
        if (startTime >= endTime) {
            resultDiv.textContent = 'O horário de término deve ser posterior ao horário de início.';
            return;
        }

    
        const roomConflict = existingSchedules.some(schedule => 
            schedule.room === room &&
            schedule.date === date &&
            startTime < schedule.endTime &&
            endTime > schedule.startTime
        );

        const exactConflict = existingSchedules.some(schedule => 
            schedule.date === date &&
            schedule.startTime === startTime &&
            schedule.endTime === endTime &&
            schedule.room === room
        );

        if (exactConflict) {
            resultDiv.textContent = 'Horário exatamente igual já está agendado para esta sala.';
        } else if (roomConflict) {
            resultDiv.textContent = 'Horário em conflito com um agendamento existente na mesma sala.';
        } else {
            resultDiv.textContent = 'Horário disponível para agendamento.';
            existingSchedules.push({ name, room, date, startTime, endTime });
            saveSchedules(existingSchedules);
            updateScheduleTable();
            form.reset();
        }
    });

    
    function handleEdit(event) {
        const row = event.target.closest('tr');
        const index = row.dataset.index;
        const schedule = existingSchedules[index];

        document.getElementById('name').value = schedule.name;
        document.getElementById('room').value = schedule.room;
        document.getElementById('date').value = schedule.date;
        document.getElementById('startTime').value = schedule.startTime;
        document.getElementById('endTime').value = schedule.endTime;

      
        existingSchedules.splice(index, 1);
        saveSchedules(existingSchedules);
        updateScheduleTable();
    }

    
    function handleRemove(event) {
        if (confirm('Você tem certeza que deseja remover este agendamento?')) {
            const row = event.target.closest('tr');
            const index = row.dataset.index;

            
            existingSchedules.splice(index, 1);
            saveSchedules(existingSchedules);
            updateScheduleTable();
        }
    }
});
