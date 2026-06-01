import { Injectable } from "@angular/core";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";

import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UpdateService {
  updateAvailable = false;

  constructor(private updates: SwUpdate) {
    if (!updates.isEnabled) {
      return;
    }

    updates.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === "VERSION_READY"),
      )
      .subscribe(() => {
        this.updateAvailable = true;
      });
    setInterval(() => {
      this.updates.checkForUpdate();
    }, 60000);
  }

  updateApp() {
    document.location.reload();
  }
}
