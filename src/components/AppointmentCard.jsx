import './AppointmentCard.css';

const STATUS_LABELS = {
  PENDING:   { label: 'Pending',   cls: 'badge-pending' },
  BOOKED:    { label: 'Confirmed', cls: 'badge-booked' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled' },
  REJECTED:  { label: 'Rejected',  cls: 'badge-rejected' },
  COMPLETED: { label: 'Completed', cls: 'badge-completed' },
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '-';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

/**
 * AppointmentCard - displays a single appointment with actions.
 *
 * Props:
 *   appointment  - appointment data object
 *   role         - 'STUDENT' | 'FACULTY'
 *   onCancel     - fn(id) for student cancel
 *   onAccept     - fn(id) for faculty accept
 *   onReject     - fn(id) for faculty reject
 */
export default function AppointmentCard({ appointment, role, onCancel, onAccept, onReject, onComplete }) {
  const status = STATUS_LABELS[appointment.status] || { label: appointment.status, cls: '' };

  return (
    <div className="appt-card">
      <div className="appt-card-header">
        <div className="appt-time-block">
          <div className="appt-date">{formatDate(appointment.slotDate)}</div>
          <div className="appt-time">
            {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
          </div>
        </div>
        <span className={`badge ${status.cls}`}>{status.label}</span>
      </div>

      <div className="appt-card-body">
        {role === 'STUDENT' && (
          <div className="appt-info-row">
            <span className="appt-info-label">Faculty</span>
            <span className="appt-info-value">{appointment.facultyName}</span>
          </div>
        )}
        {role === 'FACULTY' && (
          <div className="appt-info-row">
            <span className="appt-info-label">Student</span>
            <span className="appt-info-value">{appointment.studentName}</span>
          </div>
        )}

        {appointment.facultyDepartment && (
          <div className="appt-info-row">
            <span className="appt-info-label">Department</span>
            <span className="appt-info-value">{appointment.facultyDepartment}</span>
          </div>
        )}

        {appointment.purpose && (
          <div className="appt-info-row">
            <span className="appt-info-label">Purpose</span>
            <span className="appt-info-value">{appointment.purpose}</span>
          </div>
        )}

        {appointment.facultyNotes && (
          <div className="appt-info-row">
            <span className="appt-info-label">Faculty Note</span>
            <span className="appt-info-value italic">{appointment.facultyNotes}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="appt-card-footer">
        {role === 'STUDENT' && ['PENDING', 'BOOKED'].includes(appointment.status) && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(appointment.id)}>
            Cancel
          </button>
        )}
        {role === 'FACULTY' && appointment.status === 'PENDING' && (
          <>
            <button className="btn btn-success btn-sm" onClick={() => onAccept(appointment.id)}>
              Accept
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onReject(appointment.id)}>
              Reject
            </button>
          </>
        )}
        {role === 'FACULTY' && appointment.status === 'BOOKED' && (
          <button className="btn btn-primary btn-sm" onClick={() => onComplete(appointment.id)}>
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  );
}
