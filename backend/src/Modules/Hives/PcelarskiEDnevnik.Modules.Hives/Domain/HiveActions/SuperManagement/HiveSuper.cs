using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using System;
using System.Collections.Generic;
using System.Text;

namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement {
    public sealed class HiveSuper {
        private HiveSuper() {
        }

        private HiveSuper(
            Guid ownerBeekeeperId,
            HiveType type,
            int frameCount,
            string? colorHex) {
            Id = Guid.NewGuid();
            OwnerBeekeeperId = ownerBeekeeperId;
            Type = type;
            FrameCount = frameCount;
            ColorHex = colorHex;
            Status = HiveSuperStatus.OnHive;
            CreatedAtUtc = DateTimeOffset.UtcNow;
        }

        public Guid Id { get; private set; }

        public Guid OwnerBeekeeperId { get; private set; }

        public HiveType Type { get; private set; }

        public int FrameCount { get; private set; }

        public HiveSuperStatus Status { get; private set; }

        public string? ColorHex { get; private set; }

        public DateTimeOffset CreatedAtUtc { get; private set; }

        public DateTimeOffset? UpdatedAtUtc { get; private set; }
    }
}
